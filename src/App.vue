<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // 🛡️ 核心需求：强制每次进入或刷新都重置到个人主页
  // 使用 replace 避免在历史记录里留下一堆跳转痕迹
  router.replace('/intro/personal');
});
</script>

<style>
/* 全局基础样式 */
body, html {
  margin: 0;
  padding: 0;
  background-color: #050505;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 接管滚动条，由 MainLayout 内部处理 */
}
</style>