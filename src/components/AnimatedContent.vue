<template>
  <div ref="containerRef" class="animated-content">
    <slot />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const props = defineProps({
  threshold: {
    type: Number,
    default: 0.2
  },
  once: {
    type: Boolean,
    default: true
  }
});

const containerRef = ref(null);
let tween = null;
let trigger = null;

gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  tween = gsap.fromTo(
    containerRef.value,
    {
      autoAlpha: 0,
      y: 28,
      filter: 'blur(8px)'
    },
    {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out',
      paused: true
    }
  );

  const startAt = `${Math.max(5, Math.min(95, Math.round((1 - props.threshold) * 100)))}%`;

  trigger = ScrollTrigger.create({
    trigger: containerRef.value,
    start: `top ${startAt}`,
    once: props.once,
    onEnter: () => {
      tween?.play();
    }
  });
});

onUnmounted(() => {
  trigger?.kill();
  tween?.kill();
});
</script>

<style scoped>
.animated-content {
  width: 100%;
}
</style>
