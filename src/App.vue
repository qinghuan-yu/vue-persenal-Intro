<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PRELOAD_LIST } from '@/config/assets';

const router = useRouter();

onMounted(() => {
  // 强制每次进入或刷新都重置到首页
  router.replace('/identity');
  
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
  
  // 3. 预触发路由加载
  const routesToPrefetch = ['/projects', '/blog', '/contact'];
  routesToPrefetch.forEach(route => {
    router.resolve(route);
  });
};
</script>

<style>
/* 全局基础样式 */
body, html {
  margin: 0;
  padding: 0;
  background-color: #050505 !important; /* 强制黑色 */
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 接管滚动条，由 MainLayout 内部处理 */
}
</style>