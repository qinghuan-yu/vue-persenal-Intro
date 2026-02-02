<template>
  <section class="identity-container">
    <!-- Content Layer -->
    <div class="layer-content">
      <div class="identity-wrapper">
        <div class="profile-header page-exit-item" style="--exit-order: 0;">
          <div class="h-line-anim"></div>
          <span class="header-tag">Profile Authenticated</span>
        </div>
        
        <h1 class="main-title page-exit-item" style="--exit-order: 1;">I am Relic<br><span class="blue-text">I am Ark</span></h1>
        
        <div class="detail-grid">
          <div class="detail-left">
            <div class="detail-item group page-exit-item" style="--exit-order: 2;">
              <div class="icon-wrap">[MONITOR]</div>
              <div>
                <p class="detail-sub">Status / Objective</p>
                <p class="detail-main">JUFE Sophomore / Kaggle Prepare</p>
              </div>
            </div>
            
            <div class="detail-item group page-exit-item" style="--exit-order: 3;">
              <div class="icon-wrap">[MUSIC]</div>
              <div>
                <p class="detail-sub">Artist IN</p>
                <p class="detail-main">Animenz-Style Pianist / JPOP Producer</p>
              </div>
            </div>
          </div>

          <div class="detail-right">
            <div class="signature-box page-exit-item" style="--exit-order: 4;">
               <p class="sig-label">Signature</p>
               <p class="sig-val" style="font-family: 'Noto Sans SC', serif;">清棫</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';

// 导入所有项目图片用于预加载
import pcbUrl from '@/assets/pcb.png';
import pcb2Url from '@/assets/pcb2.png';
import pianoUrl from '@/assets/piano.png';
import aiUrl from '@/assets/AI.png';

onMounted(() => {
  // 检查是否是网站首次加载（整个会话的第一次访问）
  const isFirstVisit = !sessionStorage.getItem('hasVisited');
  const container = document.querySelector('.identity-container');
  
  if (isFirstVisit && container) {
    // 标记为已访问
    sessionStorage.setItem('hasVisited', 'true');
    
    // 添加首次加载类，触发整体淡入动画
    container.classList.add('first-load');
  }
  
  // 🔥 在后台预加载所有项目图片
  const projectImages = [pcbUrl, pcb2Url, pianoUrl, aiUrl];
  projectImages.forEach(src => {
    const img = new Image();
    img.src = src;
    // 浏览器会自动缓存这些图片，切换到 Projects 页面时无延迟
  });
});
</script>

<style scoped>
.blue-text {
  color: #22d3ee;
}

.identity-container {
  min-height: 80vh; 
  height: 100%;
  position: relative;
  overflow: hidden;
  opacity: 1; /* 默认完全显示 */
}

/* 首次加载动画：整体从黑色淡入 */
.identity-container.first-load {
  animation: fadeInFromBlack 3.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes fadeInFromBlack {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Page exit stagger animation */
.page-exit-item {
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: calc(var(--exit-order) * 0.1s);
}

.identity-container.page-leaving .page-exit-item {
  opacity: 0;
  transform: translateY(-30px);
}

.layer-content {
  display: flex;
  align-items: center;
  padding: 0 24px;
}
@media (min-width: 1024px) {
  .layer-content { padding: 0 96px; }
}

.identity-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
}
@media (min-width: 1024px) {
  .identity-wrapper { width: 66.66%; }
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
  .main-title { font-size: 160px; }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 40px;
}
@media (min-width: 768px) {
  .detail-grid { grid-template-columns: repeat(2, 1fr); }
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
}
@media (min-width: 768px) {
  .signature-box { width: 288px; }
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

.background-text {
  position: absolute;
  bottom: -5%;
  right: 0;
  pointer-events: none;
  opacity: 0.03;
  user-select: none;
}

.background-text h2 {
  font-size: 25vw;
  font-weight: 500;
  font-style: normal;
  line-height: 1;
  margin: 0;
}
</style>
