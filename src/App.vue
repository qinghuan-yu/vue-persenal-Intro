<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { PRELOAD_LIST } from '@/config/assets';
import { VIEW_ROUTES } from '@/config/navigation';

onMounted(() => {
  preloadAllAssets();
});

const preloadAllAssets = () => {
  PRELOAD_LIST.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  if (document.fonts) {
    document.fonts.load('1em "Space Grotesk"');
    document.fonts.load('1em "Noto Sans SC"');
  }

  const prefetchViews = () => {
    VIEW_ROUTES.forEach(({ component }) => component());
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(prefetchViews);
  } else {
    setTimeout(prefetchViews, 0);
  }
};
</script>
