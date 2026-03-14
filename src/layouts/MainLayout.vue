<template>
  <div class="app-container hide-scrollbar">
    <transition name="pixi-fade">
      <PixiBackground class="global-pixi-bg" />
    </transition>

    <div class="cross-grid-background"></div>
    <div class="triangle-layer">
      <div
        v-for="t in triangles"
        :key="t.id"
        class="floating-triangle"
        :style="t.style"
      ></div>
    </div>
    <div class="scan-effect"></div>

    <nav class="top-nav">
      <div class="nav-left">
        <div class="brand">
          <span class="brand-name">RELIC</span>
          <span class="brand-sub">Data Hub</span>
        </div>
        <div class="nav-divider"></div>
        <div class="nav-links">
          <button
            v-for="item in navItems"
            :key="item.key"
            class="nav-item"
            :class="{ active: activeSection === item.key }"
            @click="scrollToSection(item.key)"
          >
            <span class="item-label">{{ item.label }}</span>
            <span class="item-sub">{{ item.sub }}</span>
          </button>
        </div>
      </div>

      <div class="nav-right">
        <a href="https://terminal.reliarc.com" target="_blank" class="nav-item terminal-link">
          <span class="item-label">TERMINAL</span>
          <span class="item-sub">终端</span>
        </a>
      </div>
    </nav>

    <div class="right-sidebar">
      <div class="page-number">
        <transition name="num-slide" mode="out-in">
          <span :key="currentPageIndex" class="current-num">{{ currentPageIndex }}</span>
        </transition>
      </div>
      <div class="progress-track">
        <div class="progress-indicator" :style="{ top: indicatorPosition }">
          <div class="indicator-line"></div>
        </div>
      </div>
    </div>

    <main class="main-content">
      <ScrollVelocity text="CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // " :strength="28" />

      <section id="section-identity" class="story-section" :class="sectionClass('identity')" :ref="setSectionRef('identity')">
        <AnimatedContent :once="true" :threshold="0.25">
          <Identity />
        </AnimatedContent>
      </section>

      <div class="section-divider">
        <ScrollVelocity text="ING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // " :strength="18" />
      </div>

      <section id="section-projects" class="story-section" :class="sectionClass('projects')" :ref="setSectionRef('projects')">
        <AnimatedContent :once="true" :threshold="0.25">
          <Projects />
        </AnimatedContent>
      </section>

      <div class="section-divider">
        <ScrollVelocity text="ING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // " :strength="18" />
      </div>

      <section id="section-blog" class="story-section" :class="sectionClass('blog')" :ref="setSectionRef('blog')">
        <AnimatedContent :once="false" :threshold="0.2">
          <Blog />
        </AnimatedContent>
      </section>

      <div class="section-divider">
        <ScrollVelocity text="ING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // " :strength="18" />
      </div>

      <section id="section-music" class="story-section" :class="sectionClass('music')" :ref="setSectionRef('music')">
        <AnimatedContent :once="true" :threshold="0.25">
          <Music />
        </AnimatedContent>
      </section>

      <div class="section-divider">
        <ScrollVelocity text="ING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // CONTINUOUS STORY // RELIC DATA HUB // KEEP SCROLLING // " :strength="18" />
      </div>

      <section id="section-contact" class="story-section" :class="sectionClass('contact')" :ref="setSectionRef('contact')">
        <FadeContent :threshold="0.2">
          <Contact />
        </FadeContent>
      </section>
    </main>

    <footer class="app-footer">
      © 2026 RELIC-ARK ARCHIVE // Qing-UU
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useLenis } from 'lenis/vue';
import { useRoute, useRouter } from 'vue-router';
import PixiBackground from '@/components/PixiBackground.vue';
import AnimatedContent from '@/components/AnimatedContent.vue';
import FadeContent from '@/components/FadeContent.vue';
import ScrollVelocity from '@/components/ScrollVelocity.vue';
import Identity from '@/views/Identity/Index.vue';
import Projects from '@/views/Projects/Index.vue';
import Blog from '@/views/Blog/Index.vue';
import Music from '@/views/Music/Index.vue';
import Contact from '@/views/Contact/Index.vue';

const navItems = [
  { key: 'identity', label: 'IDENTITY', sub: '简介' },
  { key: 'projects', label: 'PROJECTS', sub: '项目' },
  { key: 'blog', label: 'BLOG', sub: '博客' },
  { key: 'music', label: 'MUSIC', sub: '音乐' },
  { key: 'contact', label: 'CONTACT', sub: '联系方式' }
];

const activeSection = ref('identity');
const focusSection = ref('identity');
const sectionRefs = ref({});
const triangles = ref([]);
const projectsHardLock = ref(false);

const route = useRoute();
const router = useRouter();
const lenisInstance = useLenis();

let sectionObserver = null;
let isInternalRouteUpdate = false;
let isSnapping = false;
let snapCooldownTimer = null;
let wheelAccumulator = 0;
let pendingProjectsLockWhenSnapEnds = false;
let projectsLockRetryTimer = null;

const PROJECTS_LOCK_DELTA_TOLERANCE = 6;

const isLockDebugEnabled = () => {
  if (typeof window === 'undefined') {
    return false;
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
    scope: 'MainLayout',
    event,
    ts: Date.now(),
    path: route.path,
    activeSection: activeSection.value,
    focusSection: focusSection.value,
    projectsHardLock: projectsHardLock.value,
    isSnapping,
    wheelAccumulator: Number(wheelAccumulator.toFixed(2)),
    ...payload
  };

  if (!Array.isArray(window.__LOCK_DEBUG__)) {
    window.__LOCK_DEBUG__ = [];
  }

  window.__LOCK_DEBUG__.push(point);
  if (window.__LOCK_DEBUG__.length > 1200) {
    window.__LOCK_DEBUG__.shift();
  }

  console.debug('[LockDebug][MainLayout]', point);
};

const emitProjectsSnapState = (snapping) => {
  window.dispatchEvent(new CustomEvent('projects-snap-state-change', {
    detail: { snapping }
  }));
};

const getTopNavOffset = () => {
  const nav = document.querySelector('.top-nav');
  if (nav instanceof HTMLElement) {
    return nav.offsetHeight;
  }

  return 96;
};

const alignSectionTop = (key, immediate = false, duration = 1.1) => {
  const target = sectionRefs.value[key];
  const lenis = lenisInstance.value;

  if (!target || !lenis) {
    return;
  }

  lenis.scrollTo(target, {
    offset: -getTopNavOffset(),
    duration: immediate ? 0 : duration,
    immediate
  });
};

const getProjectsTopDelta = () => {
  const projectsEl = sectionRefs.value.projects;
  if (!(projectsEl instanceof HTMLElement)) {
    return null;
  }

  const navOffset = getTopNavOffset();
  return projectsEl.getBoundingClientRect().top - navOffset;
};

const canStopProjectsAtCurrentPosition = () => {
  const delta = getProjectsTopDelta();
  if (delta == null) {
    return false;
  }

  return Math.abs(delta) <= PROJECTS_LOCK_DELTA_TOLERANCE;
};

const scheduleProjectsLockRetry = () => {
  if (projectsLockRetryTimer) {
    clearTimeout(projectsLockRetryTimer);
    projectsLockRetryTimer = null;
  }

  projectsLockRetryTimer = setTimeout(() => {
    const lenis = lenisInstance.value;
    if (!lenis) {
      return;
    }

    if (!projectsHardLock.value || activeSection.value !== 'projects' || isSnapping) {
      return;
    }

    const delta = getProjectsTopDelta();
    pushLockDebug('hardLockRetryCheck', {
      projectsTopDelta: delta == null ? null : Number(delta.toFixed(2))
    });

    if (canStopProjectsAtCurrentPosition()) {
      pushLockDebug('hardLockStopAfterRetry');
      lenis.stop();
      return;
    }

    scheduleProjectsLockRetry();
  }, 48);
};

const setSectionRef = (key) => (el) => {
  if (el) {
    sectionRefs.value[key] = el;
  }
};

const scrollToSection = (key) => {
  const target = sectionRefs.value[key];

  if (!target) {
    return;
  }

  const lenis = lenisInstance.value;

  if (lenis) {
    // 导航栏点击时确保 Lenis 处于运行状态（Projects 锁定时 Lenis 会被 stop）
    projectsHardLock.value = false;
    lenis.start();
    alignSectionTop(key, false);
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (route.path !== `/${key}`) {
    isInternalRouteUpdate = true;
    router.replace(`/${key}`).finally(() => {
      isInternalRouteUpdate = false;
    });
  }
};

const sectionClass = (key) => ({
  'is-active-section': activeSection.value === key,
  'is-focus-section': focusSection.value === key
});

const releaseSnapLock = () => {
  if (snapCooldownTimer) {
    clearTimeout(snapCooldownTimer);
    snapCooldownTimer = null;
  }

  snapCooldownTimer = setTimeout(() => {
    isSnapping = false;
    emitProjectsSnapState(false);

    const lenis = lenisInstance.value;
    if (
      pendingProjectsLockWhenSnapEnds &&
      lenis &&
      activeSection.value === 'projects' &&
      projectsHardLock.value
    ) {
      const delta = getProjectsTopDelta();
      pushLockDebug('hardLockAfterSnapEnd', {
        projectsTopDelta: delta == null ? null : Number(delta.toFixed(2))
      });

      if (canStopProjectsAtCurrentPosition()) {
        lenis.stop();
      } else {
        scheduleProjectsLockRetry();
      }
    }

    pendingProjectsLockWhenSnapEnds = false;
  }, 1300);
};

const snapToNeighborSection = (direction) => {
  const currentIndex = navItems.findIndex((item) => item.key === activeSection.value);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = Math.min(navItems.length - 1, Math.max(0, currentIndex + direction));
  if (nextIndex === currentIndex) {
    pushLockDebug('snapToNeighborSkip', {
      reason: 'sameIndex',
      direction,
      currentIndex
    });
    return;
  }

  isSnapping = true;
  emitProjectsSnapState(true);
  pushLockDebug('snapToNeighborStart', {
    direction,
    currentIndex,
    nextIndex,
    nextKey: navItems[nextIndex].key
  });
  scrollToSection(navItems[nextIndex].key);
  releaseSnapLock();
};

const handleGlobalWheel = (event) => {
  if (event.defaultPrevented) {
    return;
  }

  const target = event.target;
  if (target instanceof Element && target.closest('.markdown-scroll-wrapper')) {
    return;
  }

  const deltaY = event.deltaY;

  if (activeSection.value === 'projects' && projectsHardLock.value) {
    // locked 仅在 progress 处于中间状态，此时阻止任何方向的 section 切换
    wheelAccumulator = 0;
    pushLockDebug('wheelBlockedByHardLock', {
      deltaY: Number(deltaY.toFixed(2))
    });
    event.preventDefault();
    return;
  }

  if (Math.abs(deltaY) < 4) {
    pushLockDebug('wheelIgnoredSmallDelta', {
      deltaY: Number(deltaY.toFixed(2))
    });
    return;
  }

  event.preventDefault();

  if (isSnapping) {
    wheelAccumulator = 0;
    pushLockDebug('wheelIgnoredSnapping', {
      deltaY: Number(deltaY.toFixed(2))
    });
    return;
  }

  wheelAccumulator += deltaY;
  if (Math.abs(wheelAccumulator) < 60) {
    pushLockDebug('wheelAccumulate', {
      deltaY: Number(deltaY.toFixed(2)),
      wheelAccumulator: Number(wheelAccumulator.toFixed(2))
    });
    return;
  }

  const direction = wheelAccumulator > 0 ? 1 : -1;
  pushLockDebug('wheelTriggerSnap', {
    deltaY: Number(deltaY.toFixed(2)),
    direction,
    wheelAccumulator: Number(wheelAccumulator.toFixed(2))
  });
  wheelAccumulator = 0;
  snapToNeighborSection(direction);
};

const handleProjectsHardLockChange = (event) => {
  const previousLock = projectsHardLock.value;
  const nextLock = Boolean(event?.detail?.locked);
  projectsHardLock.value = nextLock;

  pushLockDebug('hardLockEvent', {
    wasLock: previousLock,
    nextLock
  });

  const lenis = lenisInstance.value;
  if (!lenis) {
    return;
  }

  if (projectsLockRetryTimer) {
    clearTimeout(projectsLockRetryTimer);
    projectsLockRetryTimer = null;
  }

  wheelAccumulator = 0;

  if (activeSection.value === 'projects' && nextLock) {
    if (isSnapping) {
      pendingProjectsLockWhenSnapEnds = true;
      pushLockDebug('hardLockDeferredBySnapping');
      return;
    }

    const delta = getProjectsTopDelta();
    pushLockDebug('hardLockTryStop', {
      wasLock: previousLock,
      projectsTopDelta: delta == null ? null : Number(delta.toFixed(2))
    });

    if (canStopProjectsAtCurrentPosition()) {
      pushLockDebug('hardLockStopLenisImmediate');
      lenis.stop();
    } else {
      pushLockDebug('hardLockWaitForAlignedPosition');
      lenis.start();
      scheduleProjectsLockRetry();
    }
    return;
  } else {
    pendingProjectsLockWhenSnapEnds = false;
    pushLockDebug('hardLockReleaseStartLenis');
    lenis.start();
  }
};

const syncFromRoute = () => {
  const key = String(route.meta?.section || '').trim();
  if (!key) {
    return;
  }

  if (key === activeSection.value) {
    focusSection.value = key;
    return;
  }

  activeSection.value = key;
  focusSection.value = key;

  nextTick(() => {
    const target = sectionRefs.value[key];
    if (!target) {
      return;
    }

    const lenis = lenisInstance.value;
    if (lenis) {
      alignSectionTop(key, false);
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};

const observeSections = () => {
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) {
        return;
      }

      const key = visibleEntries[0].target.id.replace('section-', '');
      if (key) {
        activeSection.value = key;
        focusSection.value = key;

        if (route.path !== `/${key}`) {
          isInternalRouteUpdate = true;
          router.replace(`/${key}`).finally(() => {
            isInternalRouteUpdate = false;
          });
        }
      }
    },
    {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: '-28% 0px -28% 0px'
    }
  );

  navItems.forEach((item) => {
    const el = sectionRefs.value[item.key];
    if (el) {
      sectionObserver.observe(el);
    }
  });
};

const currentPageIndex = computed(() => {
  const currentIndex = navItems.findIndex((item) => item.key === activeSection.value);
  return String(currentIndex + 1).padStart(2, '0');
});

const indicatorPosition = computed(() => {
  const currentIndex = navItems.findIndex((item) => item.key === activeSection.value);
  if (currentIndex <= 0) {
    return '0%';
  }

  const ratio = currentIndex / (navItems.length - 1);
  return `${ratio * 100}%`;
});

onMounted(() => {
  triangles.value = Array.from({ length: 30 }, (_, i) => {
    const size = 3 + Math.random() * 20;
    const floatDuration = 18 + Math.random() * 20;
    const floatDelay = -Math.random() * 40;
    const xPos = Math.random() * 100;

    const baseOpacity = 0.1 + Math.random() * 0.15;
    const peakOpacity = baseOpacity + 0.3;

    const pulseDuration = 2 + Math.random() * 4;
    const pulseDelay = -Math.random() * 10;

    return {
      id: i,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        '--x-pos': `${xPos}vw`,
        '--float-duration': `${floatDuration}s`,
        '--float-delay': `${floatDelay}s`,
        '--pulse-duration': `${pulseDuration}s`,
        '--pulse-delay': `${pulseDelay}s`,
        '--base-opacity': baseOpacity,
        '--peak-opacity': peakOpacity
      }
    };
  });

  observeSections();
  syncFromRoute();

  pushLockDebug('mounted');

  window.addEventListener('wheel', handleGlobalWheel, { passive: false });
  window.addEventListener('projects-hard-lock-change', handleProjectsHardLockChange);
});

watch(
  () => route.path,
  () => {
    if (isInternalRouteUpdate) {
      return;
    }
    syncFromRoute();
  }
);

onUnmounted(() => {
  sectionObserver?.disconnect();

  pushLockDebug('unmounted');

  if (snapCooldownTimer) {
    clearTimeout(snapCooldownTimer);
  }

  if (projectsLockRetryTimer) {
    clearTimeout(projectsLockRetryTimer);
  }

  window.removeEventListener('wheel', handleGlobalWheel);
  window.removeEventListener('projects-hard-lock-change', handleProjectsHardLockChange);
  emitProjectsSnapState(false);
});
</script>

<style scoped>
.pixi-fade-enter-active,
.pixi-fade-leave-active {
  transition: opacity 1s ease;
}

.pixi-fade-enter-from,
.pixi-fade-leave-to {
  opacity: 0;
}

.global-pixi-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 4;
  pointer-events: none;
}

.app-container {
  min-height: 100vh;
  color: white;
  font-family: 'Noto Sans SC', sans-serif;
  position: relative;
}

.cross-grid-background {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 1;
  background-color: transparent;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 160px 160px;
  background-position: 0 0;
}

.cross-grid-background::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-image: radial-gradient(circle, rgba(97, 177, 214, 0.4) 1px, transparent 1px);
  background-size: 40px 40px;
}

.triangle-layer {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.floating-triangle {
  position: absolute;
  top: 0;
  left: 0;
  background: transparent;
  width: 0;
  height: 0;
  background-color: rgba(200, 200, 200, 0.6);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  animation:
    float-up var(--float-duration, 20s) linear infinite,
    breathe var(--pulse-duration, 4s) ease-in-out infinite;
  animation-delay: var(--float-delay, 0s), var(--pulse-delay, 0s);
  will-change: transform, opacity;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

@keyframes float-up {
  0% {
    transform: translate3d(var(--x-pos), 110vh, 0);
  }
  100% {
    transform: translate3d(var(--x-pos), -20vh, 0);
  }
}

@keyframes breathe {
  0%, 100% {
    opacity: var(--base-opacity, 0.1);
  }
  50% {
    opacity: var(--peak-opacity, 0.4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-triangle {
    animation: none;
    top: 50%;
    opacity: 0.1;
  }
}

.scan-effect {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  opacity: 0.03;
  mix-blend-mode: overlay;
  background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04));
  background-size: 100% 4px, 3px 100%;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 96px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  box-sizing: border-box;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: #22d3ee;
}

.brand-sub {
  font-size: 8px;
  letter-spacing: 0.3em;
  opacity: 0.5;
  text-transform: uppercase;
}

.nav-divider {
  height: 32px;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  display: none;
}

@media (min-width: 640px) {
  .nav-divider {
    display: block;
  }
}

.nav-links {
  display: none;
  gap: 32px;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.3s;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
}

.nav-item:hover,
.nav-item.active {
  color: #22d3ee;
}

.item-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.item-sub {
  font-size: 9px;
  opacity: 0.6;
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.terminal-link {
  padding: 8px 16px;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 4px;
  transition: all 0.3s;
  background: rgba(34, 211, 238, 0.05);
}

.terminal-link:hover {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.15);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
  transform: translateY(-2px);
}

.terminal-link .item-label {
  color: #22d3ee;
}

.terminal-link .item-sub {
  color: rgba(34, 211, 238, 0.7);
}

.right-sidebar {
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.page-number {
  position: relative;
  margin-bottom: 24px;
  text-align: center;
  width: 64px;
  height: 48px;
  display: flex;
  justify-content: center;
}

.current-num {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  color: #22d3ee;
  display: block;
  width: 100%;
  clip-path: inset(0 0 25% 0);
}

.progress-track {
  height: 192px;
  width: 1px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
}

.progress-indicator {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 16px;
  border: 1px solid #22d3ee;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: top 0.35s ease;
}

.indicator-line {
  width: 1px;
  height: 8px;
  background: #22d3ee;
}

.main-content {
  padding-top: 96px;
  width: 100%;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}

.story-section {
  min-height: calc(100vh - 96px);
  height: calc(100vh - 96px);
  width: 100%;
  display: flex;
  align-items: stretch;
  position: relative;
  overflow: hidden;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  transform: translateY(26px) scale(0.985);
  opacity: 0.82;
}

.story-section.is-active-section {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.story-section.is-focus-section {
  animation: section-parallax-focus 0.75s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes section-parallax-focus {
  0% {
    transform: translateY(34px) scale(0.975);
    opacity: 0.75;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.section-divider {
  width: 100%;
  position: relative;
  z-index: 12;
}

.app-footer {
  position: fixed;
  bottom: 0;
  left: 24px;
  z-index: 90;
  font-size: 8px;
  letter-spacing: 0.4em;
  opacity: 0.3;
  text-transform: uppercase;
  padding-bottom: 16px;
}

.num-slide-enter-active,
.num-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.num-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.num-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.num-slide-enter-to,
.num-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
