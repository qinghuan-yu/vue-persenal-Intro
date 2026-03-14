<template>
  <div class="scroll-velocity" aria-hidden="true">
    <div class="velocity-track" :style="{ transform: `translate3d(${-offsetX}px, 0, 0)` }">
      <span class="velocity-text">{{ repeatedText }}</span>
      <span class="velocity-text">{{ repeatedText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: 'RELIC // DATA HUB // CONTINUOUS SCROLL // '
  },
  strength: {
    type: Number,
    default: 24
  }
});

const offsetX = ref(0);
const repeatedText = computed(() => props.text.repeat(4));

let rafId = null;
let lastScrollTop = 0;
let lastTick = 0;
let smoothedVelocity = 0;

const update = (now) => {
  const scrollTop = window.scrollY || window.pageYOffset || 0;
  const deltaY = scrollTop - lastScrollTop;
  const deltaTime = Math.max(16, now - lastTick);

  const currentVelocity = deltaY / deltaTime;
  smoothedVelocity = smoothedVelocity * 0.86 + currentVelocity * 0.14;

  offsetX.value = (offsetX.value + smoothedVelocity * props.strength + 1200) % 1200;

  lastScrollTop = scrollTop;
  lastTick = now;
  rafId = requestAnimationFrame(update);
};

onMounted(() => {
  lastScrollTop = window.scrollY || window.pageYOffset || 0;
  lastTick = performance.now();
  rafId = requestAnimationFrame(update);
});

onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});
</script>

<style scoped>
.scroll-velocity {
  width: 100%;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
}

.velocity-track {
  display: flex;
  white-space: nowrap;
  will-change: transform;
}

.velocity-text {
  display: inline-block;
  padding: 10px 0;
  margin-right: 32px;
  font-size: 11px;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: rgba(34, 211, 238, 0.8);
}
</style>
