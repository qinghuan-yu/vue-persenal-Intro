<template>
  <section ref="sectionRef" class="projects-container">
    <div class="projects-intro">
      <h3 class="projects-title">Projekts</h3>
      <p class="projects-subtitle">// Ongoing Development Logs</p>
    </div>

    <div class="horizontal-viewport">
      <div ref="trackRef" class="horizontal-track" :style="{ transform: `translate3d(${-trackOffset}px, 0, 0)` }">
        <article
          v-for="(project, index) in projects"
          :key="project.title"
          class="project-card"
          :class="{ active: index === activeIndex }"
        >
          <div class="card-top">
            <span class="card-id">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="card-type">{{ project.type }}</span>
          </div>

          <div class="card-main">
            <h2 class="card-title-cn">{{ project.title }}</h2>
            <h3 class="card-title-en">{{ project.descTitle || 'PROJECT DETAILS' }}</h3>
            <p class="card-desc">{{ project.desc }}</p>
          </div>

          <div class="card-bottom">
            <a :href="project.link" target="_blank" rel="noreferrer" class="text-link-box">
              <span class="link-label">LAUNCH PROJECT</span>
              <span class="link-arrow">↗</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePixiApp } from '@/composables/usePixiApp';
import { PROJECTS_DATA } from '@/config/projects';

const projects = PROJECTS_DATA;
const route = useRoute();
const DEBUG_PROJECTS_LOCK = false;

const isLockDebugEnabled = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (DEBUG_PROJECTS_LOCK) {
    return true;
  }

  const fromStorage = window.localStorage?.getItem('debugProjectsLock');
  if (fromStorage === '1' || fromStorage === 'true') {
    return true;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('lockDebug') === '1';
};

const pushLockDebug = (event, payload = {}) => {
  if (!isLockDebugEnabled()) {
    return;
  }

  const point = {
    scope: 'Projects',
    event,
    ts: Date.now(),
    path: route.path,
    progress: Number(progress.value.toFixed(4)),
    isLockActive: isLockActive.value,
    ...payload
  };

  if (!Array.isArray(window.__LOCK_DEBUG__)) {
    window.__LOCK_DEBUG__ = [];
  }

  window.__LOCK_DEBUG__.push(point);
  if (window.__LOCK_DEBUG__.length > 600) {
    window.__LOCK_DEBUG__.shift();
  }

  console.debug('[LockDebug][Projects]', point);
};

const sectionRef = ref(null);
const trackRef = ref(null);

const progress = ref(0);
const trackOffset = ref(0);
const activeIndex = ref(0);

const isLockActive = ref(false);
const isSectionSnapping = ref(false);

let maxOffset = 0;
let morphToShapes = null;
let sectionObserver = null;
let currentParticleIndex = -1;

const emitHardLockState = () => {
  // 只要进入横向中间进度，就必须硬锁；避免因激活门槛波动导致锁失效
  const locked = !isSectionSnapping.value && progress.value > 0 && progress.value < 1;

  pushLockDebug('emitHardLockState', {
    locked
  });

  window.dispatchEvent(new CustomEvent('projects-hard-lock-change', {
    detail: { locked }
  }));
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateParticles = async (projectIndex) => {
  if (!route.path.includes('projects')) {
    return;
  }

  if (!morphToShapes) {
    return;
  }

  if (projectIndex === currentParticleIndex || !projects[projectIndex]) {
    return;
  }

  currentParticleIndex = projectIndex;

  await morphToShapes([
    {
      source: projects[projectIndex].image,
      options: { type: 'image', sampleRate: 4, layoutX: 0.46 }
    }
  ]);
};

const syncFromProgress = () => {
  trackOffset.value = progress.value * maxOffset;

  const nextIndex = clamp(
    Math.round(progress.value * (projects.length - 1)),
    0,
    projects.length - 1
  );

  if (nextIndex !== activeIndex.value) {
    activeIndex.value = nextIndex;
    updateParticles(nextIndex);
  }

  emitHardLockState();
};

const recalculate = () => {
  if (!trackRef.value) {
    return;
  }

  const viewportWidth = window.innerWidth;
  const totalWidth = trackRef.value.scrollWidth;
  maxOffset = Math.max(0, totalWidth - viewportWidth);
  pushLockDebug('recalculate', {
    viewportWidth,
    totalWidth,
    maxOffset: Number(maxOffset.toFixed(2))
  });
  syncFromProgress();
};

const canLockNow = () => {
  if (!sectionRef.value) {
    return false;
  }

  const rect = sectionRef.value.getBoundingClientRect();
  const nav = document.querySelector('.top-nav');
  const navHeight = nav instanceof HTMLElement ? nav.offsetHeight : 96;
  const divider = sectionRef.value.previousElementSibling;
  const dividerHeight = divider instanceof HTMLElement ? divider.getBoundingClientRect().height : 0;
  const lockLine = Math.max(navHeight, window.innerHeight * 0.5 + dividerHeight * 0.5);

  if (DEBUG_PROJECTS_LOCK && route.path.includes('projects')) {
    console.debug('[ProjectsLock]', {
      route: route.path,
      top: Number(rect.top.toFixed(2)),
      lockLine: Number(lockLine.toFixed(2)),
      progress: Number(progress.value.toFixed(3)),
      isLockActive: isLockActive.value
    });
  }

  if (isLockDebugEnabled() && route.path.includes('projects')) {
    pushLockDebug('canLockNow', {
      rectTop: Number(rect.top.toFixed(2)),
      rectBottom: Number(rect.bottom.toFixed(2)),
      lockLine: Number(lockLine.toFixed(2)),
      distance: Number(Math.abs(rect.top - lockLine).toFixed(2)),
      navHeight,
      dividerHeight: Number(dividerHeight.toFixed(2))
    });
  }

  return Math.abs(rect.top - lockLine) <= 56;
};

const onWheel = (event) => {
  if (isSectionSnapping.value) {
    pushLockDebug('onWheelSkip', {
      reason: 'sectionSnapping',
      deltaY: Number(event.deltaY.toFixed(2))
    });
    return;
  }

  if (!route.path.includes('projects')) {
    pushLockDebug('onWheelSkip', {
      reason: 'routeNotProjects',
      deltaY: Number(event.deltaY.toFixed(2))
    });
    return;
  }

  if (!isLockActive.value || maxOffset <= 0) {
    pushLockDebug('onWheelSkip', {
      reason: !isLockActive.value ? 'inactive' : 'noMaxOffset',
      deltaY: Number(event.deltaY.toFixed(2))
    });
    return;
  }

  const deltaY = event.deltaY;
  if (deltaY === 0) {
    pushLockDebug('onWheelSkip', { reason: 'deltaZero' });
    return;
  }

  const goingDown = deltaY > 0;
  // 从下方（Blog）回来时 progress=1，向上不消耗事件，让 Lenis 正常过渡
  const shouldConsume =
    (goingDown && progress.value < 1) ||
    (!goingDown && progress.value > 0 && progress.value < 1);

  if (!shouldConsume) {
    pushLockDebug('onWheelSkip', {
      reason: 'shouldConsumeFalse',
      deltaY: Number(deltaY.toFixed(2)),
      goingDown
    });
    return;
  }

  event.preventDefault();

  const nextProgress = clamp(progress.value + deltaY * 0.0012, 0, 1);
  if (nextProgress === progress.value) {
    pushLockDebug('onWheelSkip', {
      reason: 'progressUnchanged',
      nextProgress: Number(nextProgress.toFixed(4))
    });
    return;
  }

  progress.value = nextProgress;
  pushLockDebug('onWheelConsume', {
    deltaY: Number(deltaY.toFixed(2)),
    nextProgress: Number(nextProgress.toFixed(4))
  });
  syncFromProgress();
};

const onWindowWheelCapture = (event) => {
  onWheel(event);
};

const onProjectsSnapStateChange = (event) => {
  isSectionSnapping.value = Boolean(event?.detail?.snapping);
  pushLockDebug('projectsSnapStateChange', {
    snapping: isSectionSnapping.value
  });
  emitHardLockState();
};

const observeSection = () => {
  if (!sectionRef.value) {
    return;
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          // 离开时按方向重置 progress，防止残留中间值在下次进入时触发误锁
          // top < 0 → 向下滚离开（进入 Blog），progress 置 1（已完成）
          // top >= 0 → 向上滚离开（回 Identity），progress 置 0（重置）
          progress.value = entry.boundingClientRect.top < 0 ? 1 : 0;
          isLockActive.value = false;
          pushLockDebug('observerExit', {
            rectTop: Number(entry.boundingClientRect.top.toFixed(2)),
            intersectionRatio: Number(entry.intersectionRatio.toFixed(4)),
            resetProgressTo: progress.value
          });
          syncFromProgress();
          emitHardLockState();
          return;
        }

        // 激活判定使用可见比例，避免 lockLine 过窄导致“完全不锁”
        isLockActive.value = entry.intersectionRatio > 0.38;
        pushLockDebug('observerEnterOrUpdate', {
          intersectionRatio: Number(entry.intersectionRatio.toFixed(4)),
          rectTop: Number(entry.boundingClientRect.top.toFixed(2)),
          setIsLockActive: isLockActive.value
        });
        updateParticles(activeIndex.value);
        emitHardLockState();
      });
    },
    {
      threshold: [0.2, 0.55, 0.85]
    }
  );

  sectionObserver.observe(sectionRef.value);
};

onMounted(async () => {
  const { init } = usePixiApp();

  try {
    const controls = await init();
    morphToShapes = controls.morphToShapes;
  } catch (error) {
    console.warn('Pixi helper not ready yet or failed:', error);
  }

  await nextTick();
  recalculate();
  observeSection();
  emitHardLockState();
  pushLockDebug('mounted', {
    activeIndex: activeIndex.value,
    progress: Number(progress.value.toFixed(4))
  });

  window.addEventListener('wheel', onWindowWheelCapture, { passive: false, capture: true });
  window.addEventListener('resize', recalculate, { passive: true });
  window.addEventListener('projects-snap-state-change', onProjectsSnapStateChange);
});

onUnmounted(() => {
  pushLockDebug('unmounted');
  window.dispatchEvent(new CustomEvent('projects-hard-lock-change', { detail: { locked: false } }));
  window.removeEventListener('wheel', onWindowWheelCapture, true);
  window.removeEventListener('resize', recalculate);
  window.removeEventListener('projects-snap-state-change', onProjectsSnapStateChange);
  sectionObserver?.disconnect();
  morphToShapes = null;
});
</script>

<style scoped>
.projects-container {
  min-height: calc(100vh - 96px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.projects-intro {
  position: absolute;
  top: 26px;
  left: 48px;
  z-index: 20;
  pointer-events: none;
}

.projects-title {
  font-size: 48px;
  color: #22d3ee;
  margin: 0;
  letter-spacing: -0.05em;
  font-weight: 500;
}

.projects-subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.42);
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin: 8px 0 0;
}

.horizontal-viewport {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.horizontal-track {
  display: flex;
  gap: 28px;
  padding: 40px 48px 0;
  will-change: transform;
  transition: transform 0.08s linear;
}

.project-card {
  width: min(78vw, 900px);
  height: min(68vh, 620px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(8px);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: scale(0.97);
  opacity: 0.62;
  transition: transform 0.45s ease, opacity 0.45s ease, border-color 0.45s ease;
}

.project-card.active {
  transform: scale(1);
  opacity: 1;
  border-color: rgba(34, 211, 238, 0.52);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-id {
  font-size: 14px;
  letter-spacing: 0.18em;
  color: #22d3ee;
}

.card-type {
  font-size: 10px;
  opacity: 0.55;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title-cn {
  font-size: clamp(28px, 4vw, 56px);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.03em;
}

.card-title-en {
  margin: 0;
  font-size: clamp(16px, 2.2vw, 30px);
  color: rgba(34, 211, 238, 0.9);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.card-desc {
  margin: 0;
  max-width: 80%;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.8;
}

.card-bottom {
  display: flex;
  justify-content: flex-start;
}

.text-link-box {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.4);
  padding: 10px 16px;
  transition: all 0.3s;
}

.text-link-box:hover {
  background: rgba(34, 211, 238, 0.12);
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.25);
}

.link-label {
  font-size: 12px;
  letter-spacing: 0.18em;
}

.link-arrow {
  font-size: 14px;
}

@media (max-width: 900px) {
  .projects-intro {
    left: 20px;
    top: 18px;
  }

  .horizontal-track {
    padding: 36px 20px 0;
  }

  .project-card {
    width: min(90vw, 780px);
    height: min(62vh, 560px);
    padding: 26px;
  }

  .card-desc {
    max-width: 100%;
  }
}
</style>
