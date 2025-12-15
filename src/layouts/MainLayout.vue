<template>
  <div id="app-layout">
    <!-- 1. PixiJS Background -->
    <div ref="pixiContainer" id="pixi-container"></div>

    <!-- Global Left Sidebar for navigation -->
    <div :class="['sidebar', { open: isSidebarOpen }]">
      <div class="sidebar-line"></div>
      <div class="sidebar-item" @click="handleSidebarNav('/intro/personal')">
        <span>介绍</span><span class="sidebar-sub">INTRO</span>
      </div>
      <div class="sidebar-item" @click="handleSidebarNav('/collab/music')">
        <span>合作</span><span class="sidebar-sub">COLLAB</span>
      </div>
      <div class="sidebar-item" @click="handleSidebarNav('/contact')">
        <span>联系方式</span><span class="sidebar-sub">CONTACT</span>
      </div>
    </div>

    <!-- Menu Trigger -->
    <div class="menu-trigger" @click="toggleSidebar">
      MENU
    </div>

    <!-- Main Content Stage -->
    <section id="main-stage" @click="handleStageClick">
      <!-- Dynamic Right Sidebar (Dot navigation) -->
      <div class="timeline-bar">
        <div class="timeline-line"></div>
        <!-- Dot navigation can be dynamically generated here based on child routes -->
      </div>

      <!-- Central Content Area -->
      <div class="content-card">
         <router-view />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePixiApp } from '../composables/usePixiApp.js';

const router = useRouter();

// Sidebar state
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleSidebarNav = (path) => {
  router.push(path);
  isSidebarOpen.value = false;
};

const handleStageClick = () => {
  if (isSidebarOpen.value) {
    isSidebarOpen.value = false;
  }
};

// PixiJS Integration
const pixiContainer = ref(null);
const { init, destroy } = usePixiApp();

onMounted(async () => {
  if (pixiContainer.value) {
    await init(pixiContainer.value);
  }
});

onUnmounted(() => {
  destroy();
});
</script>

<style>
/* Using global styles from the old App.vue */
:root {
  --color-bg: #050505;
  --color-text-main: #e6e6e6;
  --color-text-dim: #666;
  --color-accent: #61b1d6; /* 核心蓝色 */
  --border-tech: rgba(255, 255, 255, 0.15); 
  --sidebar-width: 360px;
}

#app-layout {
  font-family: 'JetBrains Mono', 'Noto Sans SC', monospace;
  background-color: var(--color-bg);
  color: var(--color-text-main);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

#pixi-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* Sidebar styles */
.sidebar {
  position: fixed; top: 0; left: 0; height: 100vh; width: var(--sidebar-width);
  background: rgba(10, 10, 10, 0.75); backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-tech); z-index: 90;
  transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.42, 0, 0.58, 1);
  display: flex; flex-direction: column; justify-content: center; padding-left: 60px;
}
.sidebar.open { transform: translateX(0); }
.sidebar-line { position: absolute; left: 40px; top: 0; bottom: 0; width: 1px; background: var(--border-tech); }
.sidebar-item {
  font-size: 1.3rem; margin-bottom: 3rem; cursor: pointer; color: #888;
  transition: all 0.3s; position: relative; display: flex; align-items: center;
}
.sidebar-item:hover { color: #fff; padding-left: 5px; }
.sidebar-item::before {
  content: ''; position: absolute; left: -15px; width: 2px; height: 0%;
  background: var(--color-accent); transition: all 0.3s;
}
.sidebar-item:hover::before { height: 100%; }
.sidebar-sub { font-size: 0.9rem; margin-left: 10px; font-family: monospace; opacity: 0.3; }

/* Menu Trigger */
.menu-trigger {
  position: fixed; top: 40px; left: 40px; z-index: 100;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: 0.1em;
  font-size: 1.4rem;
  cursor: pointer; color: var(--color-text-main); transition: all 0.3s ease;
  display: flex; align-items: center; gap: 12px; opacity: 0.8;
}
.menu-trigger:hover { opacity: 1; color: var(--color-accent); }

/* Main Stage & Right Sidebar (Timeline) */
#main-stage {
  position: relative;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr auto; /* Content and right sidebar */
  align-items: center;
  justify-content: center;
}

.timeline-bar {
  grid-column: 2 / 3;
  width: 120px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.timeline-line {
  width: 1px; height: 70%; background: var(--border-tech); position: absolute; right: 50px;
}

/* Central Content Card */
.content-card {
  grid-column: 1 / 2;
  justify-self: center; /* Center the card in the grid area */
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid var(--border-tech);
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 10;
}
</style>