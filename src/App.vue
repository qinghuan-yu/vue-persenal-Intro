<template>
  <VueLenis
    root
    :options="{
      duration: 1.4,
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.0
    }"
  >
    <router-view />
  </VueLenis>
</template>

<script setup>
import { onMounted } from 'vue';
import { VueLenis } from 'lenis/vue';
import { PRELOAD_LIST } from '@/config/assets';

onMounted(() => {
  // 🔥 预加载所有资源
  preloadAllAssets();
});

// 预加载函数
const preloadAllAssets = () => {
  // 1. 预加载所有图片资源
  PRELOAD_LIST.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
  // 2. 预加载字体
  if (document.fonts) {
    document.fonts.load('1em "Space Grotesk"');
    document.fonts.load('1em "Noto Sans SC"');
  }
};
</script>

<style>
/* 全局基础样式 */
body, html {
  margin: 0;
  padding: 0;
  background-color: #050505 !important; /* 强制黑色 */
  width: 100%;
  min-height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar,
#app::-webkit-scrollbar,
.lenis::-webkit-scrollbar,
.lenis body::-webkit-scrollbar {
  width: 0;
  height: 0;
}

#app,
.lenis,
.lenis body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>