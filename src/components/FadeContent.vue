<template>
  <div ref="containerRef" class="fade-content" :class="{ 'is-visible': isVisible }">
    <slot />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  threshold: {
    type: Number,
    default: 0.2
  }
});

const containerRef = ref(null);
const isVisible = ref(false);
let observer = null;

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      threshold: props.threshold,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  observer.observe(containerRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.fade-content {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease, filter 0.7s ease;
}

.fade-content.is-visible {
  opacity: 1;
  filter: blur(0px);
  transform: translateY(0);
}
</style>
