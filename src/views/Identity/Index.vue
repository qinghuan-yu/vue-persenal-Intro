<template>
  <section class="identity-container" ref="containerRef">
    <Teleport to="body">
      <!-- Index.html style loading overlay implementation -->
      <transition name="loading-fade">
        <div v-if="isLoading" class="app-loading-overlay">
          <div class="loader-wrapper">
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>


    <!-- Content Layer -->
    <!-- 移除 :class="{ 'content-hidden': isLoading }"，我们利用 stagger-item 的默认隐藏特性 -->
    <div class="layer-content">
      <div class="identity-wrapper">
        <!-- 1. Title Group (First) -->
        <h1 class="main-title stagger-item" style="--i: 1;"><span class="relic-text inline-hovertrans">I am Relic</span><br><span
            class="blue-text inline-hovertrans">I am Ark</span></h1>

        <!-- 2. Profile Tag & Details (Second) -->
        <div class="profile-header stagger-item" style="--i: 8;">
          <div class="h-line-anim"></div>
          <span class="header-tag inline-hovertrans">Profile Authenticated</span>
        </div>

        <div class="detail-grid">
          <div class="detail-left">
            <div class="detail-item group stagger-item" style="--i: 9;">
              <div class="icon-wrap inline-hovertrans">[MONITOR]</div>
              <div>
                <p class="detail-sub inline-hovertrans">Status / Objective</p>
                <p class="detail-main inline-hovertrans">JUFE Sophomore / Kaggle Preparing</p>
              </div>
            </div>

            <div class="detail-item group stagger-item" style="--i: 10;">
              <div class="icon-wrap inline-hovertrans">[MUSIC]</div>
              <div>
                <p class="detail-sub inline-hovertrans">Artist IN</p>
                <p class="detail-main inline-hovertrans">Animenz-Style-Pianist</p>
              </div>
            </div>
          </div>

          <div class="detail-right">
            <div class="signature-box stagger-item" style="--i: 11;">
              <p class="sig-label inline-hovertrans">Signature</p>
              <p class="sig-val inline-hovertrans" style="font-family: 'Noto Sans SC', serif;">清棫</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { preloadResources } from '@/utils/resourceLoader';
import { hasInitialLoaded } from '@/utils/globalState';

const assetsFileUrls = Object.values(
  import.meta.glob('/src/assets/**/*', {
    eager: true,
    query: '?url',
    import: 'default'
  })
);

const contactPngUrls = Object.values(
  import.meta.glob('/src/views/Contact/*.png', {
    eager: true,
    query: '?url',
    import: 'default'
  })
);

// 状态控制
const isLoading = ref(false); // 默认为 false，由逻辑决定是否开启
const progress = ref(0);
const containerRef = ref(null);

// 定义资源清单
const resources = [
  ...assetsFileUrls.map((url) => ({ type: 'file', url })),
  ...contactPngUrls.map((url) => ({ type: 'image', url })),
  { type: 'dummy' }, { type: 'dummy' }, { type: 'dummy' }
];

/* 
 * 核心逻辑：触发进场动画
 * 给容器添加 .animate-entry 类，CSS 会负责后续的 stagger 动画
 */
const triggerEntranceAnimation = () => {
  const container = containerRef.value;
  if (container) {
    // 再次强制确保没有这个类，防抖
    container.classList.remove('animate-entry');
    
    // 强制重绘 (Reflow)
    void container.offsetWidth; 

    requestAnimationFrame(() => {
      container.classList.add('animate-entry');
    });
  }
};

onMounted(async () => {
  const container = containerRef.value;
  // 初始化：绝对禁止在 Loading 期间出现动画类
  if (container) {
    container.classList.remove('animate-entry');
  }

  // === 路径 A：首次访问网站 ===
  if (!hasInitialLoaded.value) {
    isLoading.value = true;
    progress.value = 0;

    // 记录开始时间，用于计算最小停留时间
    const startTime = Date.now();

    try {
      await preloadResources(resources, (p) => {
        // 为了视觉平滑，我们可以限制更新频率，或者直接更新
        progress.value = p;
      });

      // 计算已经消耗的时间
      const elapsed = Date.now() - startTime;
      const minLoadTime = 1200; // 至少加载 1.2 秒
      const remainingTime = Math.max(0, minLoadTime - elapsed);

      // 如果加载太快，强行等待剩余时间，让进度条慢慢走
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // 强制进度条跑满
      progress.value = 100;

      // 关键：给足够的时间 (1秒) 让 CSS transition (0.2s) 跑完，并且让用户看清“100%”这个状态
      // 不要急着关掉
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 关闭遮罩
      isLoading.value = false;
      hasInitialLoaded.value = true;

      // 确保遮罩完全消失（CSS fade Out 0.6s）后再执行动画
      // 保持 0.8s 的缓冲
      setTimeout(() => {
        triggerEntranceAnimation();
      }, 800);

    } catch (e) {
      console.error("Loading error", e);
      isLoading.value = false;
      hasInitialLoaded.value = true;
      triggerEntranceAnimation();
    }
  } 
  
  // === 路径 B：后续访问 ===
  else {
    isLoading.value = false; 
    
    setTimeout(() => {
      triggerEntranceAnimation();
    }, 100);
  }
});

// 不再需要旧的 complex event handlers
</script>

<style scoped>
.blue-text {
  color: #22d3ee;
}

.relic-text {
  color: #888888;
}

/* 悬停发光放大 */
.inline-hovertrans {
  display: inline-block;
  transition: all 0.3s;
  user-select: none;
}

.inline-hovertrans:hover {
  text-shadow: 0 0 10px;
  transform: scale(1.02);
}

/* App Level Loading Screen Styles migrated from index.html */
.app-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #050505;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.loader-wrapper {
  width: 600px; /* Wider progress bar */
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Progress Bar */
.progress-container {
  width: 100%;
  height: 2px;
  background: rgba(255,255,255,0.1);
  overflow: hidden;
  transition: opacity 0.6s ease;
}

.progress-bar {
  height: 100%;
  background: #22d3ee; /* Cyan */
  width: 0%;
  transition: width 0.2s linear;
}

/* Vue Transition logic matching the old index.html fading steps */
.loading-fade-leave-active {
  transition: opacity 1.0s ease 0.6s; /* overlay execution */
}
.loading-fade-leave-active .progress-container {
   opacity: 0; /* step 1: bar fades */
}
.loading-fade-leave-to {
  opacity: 0; /* step 2: overlay fades */
}


.identity-container {
  min-height: 80vh;
  height: 100%;
  position: relative;
  overflow: hidden;
  /* Default state handled by items */
}

/* Stagger Animation System */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

/* When container has 'animate-entry', trigger children */
.identity-container.animate-entry .stagger-item {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(var(--i) * 0.1s);
  /* Speed up base logic slightly */
}

/* 1. Title appears FIRST (Solo) */
/* Instant or very fast */
.identity-container.animate-entry .main-title.stagger-item {
  transition-delay: 0.1s;
}

/* 2. Figure 2 Content - Layered Stagger */
/* Profile Header (Top of Fig 2) */
/* Shorter Gap: 0.8s -> 0.5s */
.identity-container.animate-entry .profile-header.stagger-item {
  transition-delay: 0.5s !important;
}

/* Left Column Details (Monitor, Music) */
.identity-container.animate-entry .detail-left .stagger-item:nth-child(1) {
  transition-delay: 0.7s !important;
}

.identity-container.animate-entry .detail-left .stagger-item:nth-child(2) {
  transition-delay: 0.9s !important;
}

/* Right Column (Signature) */
.identity-container.animate-entry .signature-box.stagger-item {
  transition-delay: 1.1s !important;
}

.layer-content {
  display: flex;
  align-items: center;
  padding: 0 24px;
}

@media (min-width: 1024px) {
  .layer-content {
    padding: 0 96px;
  }
}

.identity-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
}

@media (min-width: 1024px) {
  .identity-wrapper {
    width: 66.66%;
  }
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.h-line-anim {
  height: 2px;
  width: 48px;
  background-color: #22d3ee;
}

.header-tag {
  font-size: 12px;
  letter-spacing: 0.5em;
  color: #22d3ee;
  font-weight: 500;
  text-transform: uppercase;
}

.main-title {
  font-size: 72px;
  font-weight: 500;
  font-style: normal;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 32px;
  margin-top: 0;
  text-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (min-width: 1024px) {
  .main-title {
    font-size: 160px;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 40px;
}

@media (min-width: 768px) {
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.detail-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-wrap {
  color: #22d3ee;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  min-width: 85px;
  /* Ensure alignment between items */
}

.detail-sub {
  font-size: 10px;
  opacity: 0.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4px;
  margin-top: 0;
}

.detail-main {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1em;
  margin: 0;
}

.detail-right {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  text-align: right;
}

.signature-box {
  background: transparent;
  border-left: 2px solid #22d3ee;
  padding: 24px;
  width: 100%;
  backdrop-filter: none;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .signature-box {
    width: 288px;
  }
}

.sig-label {
  font-size: 9px;
  opacity: 0.4;
  margin-bottom: 8px;
  letter-spacing: 0.1em;
  margin-top: 0;
}

.sig-val {
  font-size: 20px;
  font-family: monospace;
  font-weight: 500;
  letter-spacing: -0.05em;
  color: #22d3ee;
  margin: 0;
}

</style>
