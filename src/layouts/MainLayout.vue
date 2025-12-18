<template>
  <div id="app-layout" @wheel.prevent="handleWheel">
    <div ref="pixiContainer" id="pixi-container"></div>
    <div :class="['sidebar', { open: isSidebarOpen }]" ref="sidebarRef" style="opacity: 0; visibility: hidden;">
      <div class="sidebar-line"></div>
      <router-link to="/intro" class="sidebar-item"><span>介绍</span><span class="sidebar-sub">INTRO</span></router-link>
      <router-link to="/collab" class="sidebar-item"><span>合作</span><span
          class="sidebar-sub">COLLAB</span></router-link>
      <router-link to="/contact" class="sidebar-item"><span>联系方式</span><span
          class="sidebar-sub">CONTACT</span></router-link>
    </div>
    <div class="menu-trigger" @click="toggleSidebar" ref="menuTriggerRef" style="opacity: 0; visibility: hidden;">MENU
    </div>
    
    <!-- 装饰性SVG元素 -->
    <svg class="decoration-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- 左上角十字瞄准线 -->
      <g class="crosshair" transform="translate(100, 100)">
        <line x1="-20" y1="0" x2="20" y2="0" stroke="rgba(97, 177, 214, 0.3)" stroke-width="1"/>
        <line x1="0" y1="-20" x2="0" y2="20" stroke="rgba(97, 177, 214, 0.3)" stroke-width="1"/>
        <circle cx="0" cy="0" r="15" fill="none" stroke="rgba(97, 177, 214, 0.3)" stroke-width="1"/>
      </g>
      
      <!-- 右下角动态三角形 -->
      <g class="triangle-deco" transform="translate(-100, -100)">
        <polygon points="0,0 30,0 15,25" fill="none" stroke="rgba(97, 177, 214, 0.4)" stroke-width="1" class="triangle-1"/>
        <polygon points="0,0 30,0 15,25" fill="none" stroke="rgba(97, 177, 214, 0.2)" stroke-width="1" class="triangle-2" transform="scale(1.3)"/>
      </g>
      
      <!-- 装饰性连接线（从中心到边缘） -->
      <line class="connect-line" x1="50%" y1="50%" x2="95%" y2="20%" stroke="rgba(97, 177, 214, 0.15)" stroke-width="1" stroke-dasharray="5,5"/>
      <circle class="pulse-dot" cx="95%" cy="20%" r="3" fill="rgba(97, 177, 214, 0.6)"/>
    </svg>
    
    <section id="main-stage" @click="handleStageClick">
      <div v-if="isIntroPlaying" ref="loaderTextRef" class="loader-container">
        <div class="loader-text-zh">神经元连接中</div>
        <div class="loader-text-en">NEURAL CONNECTION ESTABLISHING</div>
      </div>
      <div class="timeline-bar" ref="timelineBarRef" style="opacity: 0; visibility: hidden;">
        <div class="timeline-line"></div>
        <div v-for="(item, index) in rightNavItems" :key="index"
          :class="['nav-node', { active: currentRoute === item.to }]" @click="navigate(item.to)">
          <div class="nav-label"><span class="zh">{{ item.name }}</span><span class="en">{{ item.en_name }}</span></div>
          <svg class="nav-node-svg" width="16" height="16" viewBox="0 0 16 16">
            <polygon class="nav-polygon" points="8,2 14,6 12,14 4,14 2,6" 
              fill="rgba(10, 10, 10, 0.8)" 
              stroke="rgba(255, 255, 255, 0.3)" 
              stroke-width="1"/>
            <polygon class="nav-polygon-glow" points="8,2 14,6 12,14 4,14 2,6" 
              fill="none" 
              stroke="rgba(97, 177, 214, 0)" 
              stroke-width="2"/>
          </svg>
        </div>
      </div>
      <div class="content-card" ref="contentCardRef">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        <div class="card-header" ref="cardHeaderRef" style="opacity: 0; visibility: hidden;">
          <div class="status-row">
            <div class="status-dot"></div><span class="status-text">SYSTEM // ONLINE</span>
          </div>
          <div class="title-wrapper">
            <svg class="title-border" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120">
              <!-- 切角边框路径 -->
              <path class="border-path" d="M 20,0 L 380,0 L 400,20 L 400,100 L 380,120 L 20,120 L 0,100 L 0,20 Z" 
                fill="none" 
                stroke="rgba(97, 177, 214, 0.4)" 
                stroke-width="1"/>
              <path class="border-glow" d="M 20,0 L 380,0 L 400,20 L 400,100 L 380,120 L 20,120 L 0,100 L 0,20 Z" 
                fill="none" 
                stroke="rgba(97, 177, 214, 0.8)" 
                stroke-width="2"/>
              <!-- 黄色装饰色块 -->
              <rect x="370" y="5" width="20" height="4" fill="#F4D03F" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>
              </rect>
              <rect x="5" y="111" width="15" height="4" fill="#F4D03F" opacity="0.8"/>
              <!-- 装饰性条形码 -->
              <g class="barcode" transform="translate(10, 105)" opacity="0.2">
                <rect x="0" width="2" height="10" fill="#61b1d6"/>
                <rect x="4" width="1" height="10" fill="#61b1d6"/>
                <rect x="7" width="3" height="10" fill="#61b1d6"/>
                <rect x="12" width="1" height="10" fill="#61b1d6"/>
                <rect x="15" width="2" height="10" fill="#61b1d6"/>
                <rect x="19" width="1" height="10" fill="#61b1d6"/>
                <rect x="22" width="3" height="10" fill="#61b1d6"/>
              </g>
              <!-- 系统信息微文本 -->
              <text x="320" y="113" font-size="8" fill="rgba(255, 255, 255, 0.3)" font-family="monospace">VER. 2.0.45</text>
            </svg>
            <h1 class="glitch-title" data-text="I am Relic">
              I am Relic<br>
              <span class="glitch-accent" data-text="I am Ark">I am Ark</span>
            </h1>
          </div>
        </div>
        <div class="clipper-box" ref="clipperRef" style="overflow: hidden; position: relative;">
          <div ref="innerWrapperRef" style="position: relative;">
            <router-view v-slot="{ Component }">
              <transition :css="false" mode="out-in" @leave="onLeave" @enter="onEnter">
                <component :is="Component" :key="route.path" />
              </transition>
            </router-view>
          </div>
        </div>
      </div>
    </section>
    <div class="bottom-bar"></div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import gsap from 'gsap';
import { usePixiApp } from '../composables/usePixiApp.js';
import qqQrCode from '@/assets/QQ.png';
import wechatQrCode from '@/assets/WeChat.png';
const router = useRouter();
const route = useRoute();
const { init, destroy } = usePixiApp();
let morphToShapes = null;
// Refs
const pixiContainer = ref(null);
const sidebarRef = ref(null);
const menuTriggerRef = ref(null);
const timelineBarRef = ref(null);
const contentCardRef = ref(null);
const cardHeaderRef = ref(null);
const clipperRef = ref(null);
const innerWrapperRef = ref(null);
const loaderTextRef = ref(null);
// State
const isIntroPlaying = ref(true);
const isSidebarOpen = ref(false);
let isThrottled = false; // 用于滚轮节流

// 视差效果状态
const mouseX = ref(0);
const mouseY = ref(0);
// --- 动画逻辑 ---
// 1. 离开动画
const onLeave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete: done
  });
};
// 2. 进入动画
const onEnter = (el, done) => {
  gsap.set(el, { opacity: 0 });
  
  nextTick(() => {
    document.fonts.ready.then(() => {
      if (!clipperRef.value || !innerWrapperRef.value) { done(); return; }
      
      const startHeight = clipperRef.value.offsetHeight;
      
      // 使用 setTimeout 确保 vScramble 已完成同步高度设置
      // 增加延迟时间，确保所有子组件的 mounted 钩子都已执行
      setTimeout(() => {
        // 临时设置为 auto 以计算最终高度
        clipperRef.value.style.height = 'auto';
        
        // 等待一帧，让浏览器完成布局计算
        requestAnimationFrame(() => {
          // 使用 scrollHeight 获取包含所有内容的真实高度
          const targetHeight = innerWrapperRef.value.scrollHeight;
          
          // 恢复起始高度
          clipperRef.value.style.height = `${startHeight}px`;
          
          // 执行平滑过渡动画
          const tl = gsap.timeline({
            onComplete: () => {
              // 不设置auto，保持固定高度，避免突变
              // 高度会在窗口resize时自动调整
              done();
            }
          });
          
          // 高度过渡（一次性到达最终高度）
          tl.to(clipperRef.value, {
            height: targetHeight,
            duration: 0.5,
            ease: "power3.inOut"
          });
          
          // 透明度过渡
          tl.to(el, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          }, "-=0.2");
        });
      }, 50); // 增加延迟到 50ms，确保子组件 mounted 完成
    });
  });
};
// --- 生命周期与粒子系统 ---
onMounted(async () => {
  if (pixiContainer.value) {
    const controls = await init(pixiContainer.value);
    morphToShapes = controls.morphToShapes;
  }
  gsap.set([sidebarRef.value, menuTriggerRef.value, timelineBarRef.value, cardHeaderRef.value], { autoAlpha: 0 });
  gsap.set(clipperRef.value, { height: 0 });
  const introTl = gsap.timeline({
    onComplete: () => {
      isIntroPlaying.value = false;
      // 不设置auto，保持固定高度，避免突变
    }
  });
  introTl
    .to(loaderTextRef.value, { autoAlpha: 0, duration: 0.5, delay: 1.5 })
    .add(() => gsap.set(contentCardRef.value, { backgroundColor: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(5px)' }))
    .to(contentCardRef.value, { borderTopColor: 'var(--border-tech)', borderBottomColor: 'var(--border-tech)', duration: 0.5 }, "<")
    .to(clipperRef.value, { height: () => innerWrapperRef.value.scrollHeight, duration: 0.8, ease: 'power3.inOut' }, "<")
    .to(innerWrapperRef.value, { autoAlpha: 1, duration: 0.5 })
    .to([sidebarRef.value, menuTriggerRef.value, timelineBarRef.value, cardHeaderRef.value], { autoAlpha: 1, duration: 0.5, stagger: 0.1 });
  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
});
watch(route, (newRoute) => {
  if (!morphToShapes) return;
  // 确保路由对象已就绪
  if (!newRoute || !newRoute.path) return;
  
  // Contact 页面：显示两个二维码粒子（左右两侧）+ 底部邮箱文字
  if (newRoute.path.includes('/contact')) {
    const shapes = [
      {
        source: 'Reliarc.me@outlook.com',
        options: {
          type: 'text',
          fontSize: 60,
          fontFamily: 'Arial, sans-serif',
          color: '#61b1d6'
        }
      },
      {
        source: qqQrCode,
        options: { type: 'image', scale: 1.0 }
      },
      {
        source: wechatQrCode,
        options: { type: 'image', scale: 1.0 }
      }
    ];
    morphToShapes(shapes);
  }
  // 其他所有页面：清空粒子，回归网络背景
  else {
    morphToShapes([]);
  }
}, { immediate: true, deep: true });
onUnmounted(() => {
  destroy();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleMouseMove);
});
const handleResize = () => {
  if (!isIntroPlaying.value && clipperRef.value && innerWrapperRef.value) {
    clipperRef.value.style.height = 'auto';
  }
}

// 鼠标移动视差效果
const handleMouseMove = (e) => {
  if (isIntroPlaying.value || !contentCardRef.value) return;
  
  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;
  
  // 将鼠标位置归一化到 -1 到 1 的范围
  mouseX.value = (clientX / innerWidth - 0.5) * 2;
  mouseY.value = (clientY / innerHeight - 0.5) * 2;
  
  // 计算视差偏移量（反向移动，增加纵深感）
  const offsetX = mouseX.value * -20; // 最大偏移 20px
  const offsetY = mouseY.value * -20;
  
  // 使用 GSAP 实现平滑过渡
  gsap.to(contentCardRef.value, {
    x: offsetX,
    y: offsetY,
    duration: 0.5,
    ease: 'power2.out'
  });
};
// --- 导航逻辑 ---
const currentRoute = computed(() => route.path);
const rightNavItems = computed(() => {
  const section = route.path.split('/')[1];
  if (section === 'intro') return [
    { to: '/intro/personal', name: '个人', en_name: 'Personal' },
    { to: '/intro/skills', name: '技能', en_name: 'Skills' },
    { to: '/intro/ongoing', name: '项目', en_name: 'Ongoing' },
    { to: '/intro/finished', name: '作品', en_name: 'Finished' },
    { to: '/intro/links', name: '链接', en_name: 'Links' },
  ];
  if (section === 'collab') return [
    { to: '/collab/music', name: '音乐', en_name: 'Music' },
    { to: '/collab/dev', name: '开发', en_name: 'Dev' },
  ];
  return [];
});
const toggleSidebar = () => { if (!isIntroPlaying.value) isSidebarOpen.value = !isSidebarOpen.value; };
const handleStageClick = () => { if (isSidebarOpen.value) isSidebarOpen.value = false; };
const navigate = (path) => { if (route.path !== path) router.push(path); };
// 滚轮切换逻辑 (恢复了完整逻辑，修复了 unused vars 错误)
const handleWheel = (event) => {
  if (isSidebarOpen.value || isIntroPlaying.value) return;
  if (isThrottled) return;
  isThrottled = true;
  setTimeout(() => { isThrottled = false; }, 500);
  const navItems = rightNavItems.value;
  if (navItems.length <= 1) return;
  const currentIndex = navItems.findIndex(item => item.to === currentRoute.value);
  if (currentIndex === -1) return;
  const direction = event.deltaY > 0 ? 1 : -1;
  let nextIndex = currentIndex + direction;
  if (nextIndex < 0) nextIndex = 0;
  else if (nextIndex >= navItems.length) nextIndex = navItems.length - 1;
  if (nextIndex !== currentIndex) navigate(navItems[nextIndex].to);
};
</script>
<style>
/* 全局变量 */
:root {
  --color-bg: #050505;
  --color-text-main: #e6e6e6;
  --color-text-dim: #666;
  --color-accent: #61b1d6;
  --color-warning: #F4D03F;
  --border-tech: rgba(255, 255, 255, 0.15);
  --sidebar-width: 360px;
}
body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
}
#app-layout {
  font-family: 'JetBrains Mono', 'Noto Sans SC', monospace;
  color: var(--color-text-main);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}
#pixi-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
/* Loader */
/* Loader - 修复重影问题：改为全屏黑色遮罩 */
.loader-container {
  position: fixed;
  /* 1. 改为 fixed，确保锁死在屏幕上 */
  top: 0;
  left: 0;
  width: 100vw;
  /* 2. 宽度铺满 */
  height: 100vh;
  /* 3. 高度铺满 */
  background-color: var(--color-bg);
  /* 4. 关键：加上黑色背景色，挡住下面内容 */
  /* 布局保持居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  /* 5. 确保层级最高 */
  text-align: center;
  /* ⚠️ 注意：删掉了原本的 transform: translate(-50%, -50%)，因为全屏布局不需要这个偏移了 */
}
/* 中文文本：去掉竖排属性，增加字间距以保持科技感 */
.loader-text-zh {
  /* writing-mode: vertical-rl;  <-- 删除或注释掉这一行 */
  writing-mode: horizontal-tb;
  /* 强制设为横向 */
  font-size: 24px;
  /* 根据需要调整大小 */
  font-weight: bold;
  letter-spacing: 0.5em;
  /* 增加字间距，横向排版时这样更有设计感 */
  margin-bottom: 10px;
  /* 中文和英文之间的间距 */
  color: #fff;
  /* 确保颜色正确 */
  text-shadow: 0 0 10px rgba(97, 177, 214, 0.5);
  /* 保持发光效果 */
}
/* 英文文本：通常不需要大改，保持字间距即可 */
.loader-text-en {
  font-size: 12px;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.6);
  /* 假设你用了等宽字体 */
}
/* 侧边栏 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-tech);
  z-index: 90;
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.42, 0, 0.58, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 60px;
}
.sidebar.open {
  transform: translateX(0);
}
.sidebar-line {
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border-tech);
}
.sidebar-item {
  font-size: 1.3rem;
  margin-bottom: 3rem;
  cursor: pointer;
  color: #888;
  transition: all 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  text-decoration: none;
}
.sidebar-item:hover {
  color: #fff;
  padding-left: 5px;
}
.sidebar-item::before {
  content: '';
  position: absolute;
  left: -15px;
  width: 2px;
  height: 0%;
  background: var(--color-accent);
  transition: all 0.3s;
}
.sidebar-item:hover::before {
  height: 100%;
}
.sidebar-item.router-link-active {
  color: #fff;
  padding-left: 5px;
}
.sidebar-item.router-link-active::before {
  height: 100%;
  background: var(--color-accent);
}
.sidebar-sub {
  font-size: 0.9rem;
  margin-left: 10px;
  font-family: monospace;
  opacity: 0.3;
}
/* 菜单触发器 */
.menu-trigger {
  position: fixed;
  top: 40px;
  left: 40px;
  z-index: 100;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--color-text-main);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.8;
}
.menu-trigger::before {
  content: '';
  display: block;
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s;
}
.menu-trigger:hover {
  opacity: 1;
  color: var(--color-accent);
}
.menu-trigger:hover::before {
  background: var(--color-accent);
  box-shadow: 0 0 10px var(--color-accent);
}
/* 主舞台 */
#main-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 右侧时间轴 */
.timeline-bar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
}
.timeline-line {
  width: 1px;
  height: 70%;
  background: var(--border-tech);
  position: absolute;
  right: 50px;
}
.nav-node {
  position: relative;
  margin: 1.8rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding-right: 42px;
}

.nav-node-svg {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.nav-polygon {
  transition: all 0.3s ease;
}

.nav-polygon-glow {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  transition: all 0.3s ease;
}

.nav-node:hover .nav-node-svg {
  transform: rotate(72deg);
}

.nav-node:hover .nav-polygon {
  fill: rgba(97, 177, 214, 0.1);
  stroke: rgba(97, 177, 214, 0.8);
}

.nav-node:hover .nav-polygon-glow {
  stroke: rgba(97, 177, 214, 1);
  stroke-dashoffset: 0;
  animation: stroke-flow 1.5s linear infinite;
}

@keyframes stroke-flow {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.nav-node.active {
  padding-right: 39px;
}

.nav-node.active .nav-node-svg {
  transform: scale(1.3);
}

.nav-node.active .nav-polygon {
  fill: rgba(97, 177, 214, 0.2);
  stroke: rgba(97, 177, 214, 1);
  filter: drop-shadow(0 0 5px rgba(97, 177, 214, 0.6));
}

.nav-node.active .nav-polygon-glow {
  stroke: rgba(97, 177, 214, 1);
  stroke-dashoffset: 0;
  animation: stroke-flow 2s linear infinite;
}
.nav-label {
  position: absolute;
  right: 72px;
  text-align: right;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.nav-label .zh {
  display: block;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 500;
}
.nav-label .en {
  display: block;
  font-size: 0.6rem;
  color: var(--color-accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.nav-node:hover .nav-node-circle {
  background: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
}
.nav-node:hover .nav-label {
  opacity: 1;
  transform: translateX(0);
}
.nav-node.active {
  padding-right: 44px;
}
.nav-node.active .nav-node-circle {
  width: 12px;
  height: 12px;
  background: #000;
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 10px rgba(97, 177, 214, 0.4);
}
.nav-node.active .nav-label {
  opacity: 1;
  transform: translateX(0);
}

/* 装饰性SVG元素 */
.decoration-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: visible;
}

.crosshair {
  animation: rotate-crosshair 10s linear infinite;
}

@keyframes rotate-crosshair {
  0% { transform: translate(100px, 100px) rotate(0deg); }
  100% { transform: translate(100px, 100px) rotate(360deg); }
}

.triangle-deco {
  position: absolute;
  right: 100px;
  bottom: 100px;
}

.triangle-1 {
  animation: triangle-pulse 2s ease-in-out infinite;
}

.triangle-2 {
  animation: triangle-pulse 2s ease-in-out infinite 1s;
}

@keyframes triangle-pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.connect-line {
  animation: dash-flow 3s linear infinite;
}

@keyframes dash-flow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -20;
  }
}

.pulse-dot {
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% {
    r: 3;
    opacity: 0.6;
  }
  50% {
    r: 5;
    opacity: 1;
  }
}
/* 内容卡片 - 使用切角设计 */
.content-card {
  box-sizing: border-box;
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid var(--border-tech);
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 10;
  transition: border-color 0.3s;
  overflow: visible;
  /* 使用 clip-path 实现切角 */
  clip-path: polygon(
    20px 0,           /* 左上切角 */
    calc(100% - 20px) 0,  /* 右上切角 */
    100% 20px,
    100% calc(100% - 20px), /* 右下切角 */
    calc(100% - 20px) 100%,
    20px 100%,        /* 左下切角 */
    0 calc(100% - 20px),
    0 20px
  );
}
.content-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
}
/* Clipper 容器：动画核心 */
.clipper-box {
  overflow: hidden;
  height: auto;
  position: relative;
  will-change: height;
}
/* 角落装饰 - 改为45度切角线条 */
.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: var(--color-accent);
  border-style: solid;
  opacity: 0.4;
  transition: all 0.3s;
  border-width: 0;
}
.tl {
  top: 0;
  left: 0;
  border-left: 2px solid var(--color-accent);
  border-top: 2px solid var(--color-accent);
  clip-path: polygon(0 0, 100% 0, 0 100%);
}
.tr {
  top: 0;
  right: 0;
  border-right: 2px solid var(--color-accent);
  border-top: 2px solid var(--color-accent);
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}
.bl {
  bottom: 0;
  left: 0;
  border-left: 2px solid var(--color-accent);
  border-bottom: 2px solid var(--color-accent);
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}
.br {
  bottom: 0;
  right: 0;
  border-right: 2px solid var(--color-accent);
  border-bottom: 2px solid var(--color-accent);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}
.content-card:hover .corner {
  width: 30px;
  height: 30px;
  opacity: 1;
}
/* 状态与文本 */
.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
.status-text {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  font-weight: bold;
}
@keyframes pulse {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}

/* 标题边框容器 */
.title-wrapper {
  position: relative;
  display: inline-block;
}

.title-border {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 120px;
  pointer-events: none;
  z-index: 0;
}

.border-path {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: draw-border 2s ease-out forwards;
  animation-delay: 0.5s;
}

.border-glow {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: draw-border 2s ease-out forwards;
  animation-delay: 0.5s;
  filter: blur(3px);
}

@keyframes draw-border {
  to {
    stroke-dashoffset: 0;
  }
}

.barcode {
  animation: barcode-flicker 3s infinite;
}

@keyframes barcode-flicker {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

.glitch-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  margin: 0 0 1rem 0;
  line-height: 0.9;
  color: #fff;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.glitch-title::before,
.glitch-title::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.glitch-title::before {
  color: #ff00ff;
  z-index: -1;
  /* 常驻故障动画（一直播放） */
  animation: glitch-1 1.2s linear infinite;
}

.glitch-title::after {
  color: #00ffff;
  z-index: -2;
  /* 常驻故障动画（一直播放） */
  animation: glitch-2 1.5s linear infinite;
}
/* 移除 hover 触发逻辑：故障效果常驻 */

.glitch-accent {
  color: var(--color-accent);
  position: relative;
  display: inline-block;
}

.glitch-accent::before,
.glitch-accent::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.glitch-accent::before {
  color: #ff00ff;
  z-index: -1;
  /* 常驻故障动画 */
  animation: glitch-1 1.2s linear infinite;
}

.glitch-accent::after {
  color: #00ffff;
  z-index: -2;
  /* 常驻故障动画 */
  animation: glitch-2 1.5s linear infinite;
}
/* 移除 hover 触发逻辑：故障效果常驻 */

@keyframes glitch-1 {
  0% {
    opacity: 1;
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  }
  5% {
    opacity: 1;
    transform: translate(-3px, 2px);
    clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
  }
  10% {
    opacity: 1;
    transform: translate(3px, -2px);
    clip-path: polygon(0 0, 100% 0, 100% 20%, 0 20%);
  }
  15% {
    opacity: 1;
    transform: translate(-2px, -3px);
    clip-path: polygon(0 80%, 100% 80%, 100% 100%, 0 100%);
  }
  20% {
    opacity: 1;
    transform: translate(2px, 3px);
    clip-path: polygon(0 40%, 100% 40%, 100% 70%, 0 70%);
  }
  25% {
    opacity: 0;
    transform: translate(0);
  }
  100% {
    opacity: 0;
    transform: translate(0);
  }
}

@keyframes glitch-2 {
  0% {
    opacity: 1;
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 30%, 0 30%);
  }
  5% {
    opacity: 1;
    transform: translate(2px, -3px);
    clip-path: polygon(0 70%, 100% 70%, 100% 100%, 0 100%);
  }
  10% {
    opacity: 1;
    transform: translate(-3px, 2px);
    clip-path: polygon(0 10%, 100% 10%, 100% 40%, 0 40%);
  }
  15% {
    opacity: 1;
    transform: translate(3px, 3px);
    clip-path: polygon(0 50%, 100% 50%, 100% 90%, 0 90%);
  }
  20% {
    opacity: 1;
    transform: translate(-2px, -2px);
    clip-path: polygon(0 0, 100% 0, 100% 25%, 0 25%);
  }
  25% {
    opacity: 0;
    transform: translate(0);
  }
  100% {
    opacity: 0;
    transform: translate(0);
  }
}
/* 底部栏 */
.bottom-bar {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}
</style>
