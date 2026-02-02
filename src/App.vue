<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // 强制每次进入或刷新都重置到首页
  router.replace('/identity');
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