<template>
  <div class="music-page layer-content">
    <div class="music-wrapper">
      <!-- Left Panel: Playlist -->
      <div class="music-left">
        <h2 class="playlist-header">
          <span class="header-cn">播放列表(PREVIEW)</span>
          <span class="header-en">PLAYLIST</span>
        </h2>
        <div class="music-list-container">
            <transition-group 
              tag="div" 
              name="staggered-list" 
              class="archive-list"
              appear
            >
              <button 
                v-for="(song, index) in songs" 
                :key="index"
                @click="selectSong(index)"
                class="ak-list-item"
                :class="{ active: currentSongIndex === index }"
                :style="{ '--i': index }"
              >
                <div class="item-content-row">
                    <span class="song-index">{{ String(index + 1).padStart(2, '0') }}</span>
                    <span class="item-title-cn">{{ song.name }}</span>
                    <!-- Playing Indicator inline -->
                    <div v-if="currentSongIndex === index && isPlaying" class="playing-indicator-mini">
                      <span></span><span></span><span></span>
                    </div>
                </div>
                <div class="item-separator"></div>
              </button>
            </transition-group>
        </div>
      </div>

      <!-- Right Panel: Visualizer -->
      <div class="music-right">
        <div class="visualizer-container">
          <!-- 移除 loading-state，始终显示 visualizer -->
          
          <div class="circle-visualizer" ref="visualizerRef">
            <div
              v-for="n in linesTotal"
              :key="n"
              class="line"
              :style="{ 
                transform: `rotate(${360 / linesTotal * (n - 1)}deg)`,
                '--i': n,
                '--total': linesTotal
              }"
              ref="lineRefs"
            ></div>
            
            <!-- Center Info -->
            <div class="center-info">
              <div class="play-btn" @click="togglePlay">
                <span v-if="!isPlaying" class="icon-play">▶</span>
                <span v-else class="icon-pause">❚❚</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

// 导入音乐文件 - 请确保路径正确
import song1Url from '../../music/からっぽの星で.mp3?url';
import song2Url from '../../music/走り出した朝に.mp3?url';

const songs = [
  { name: 'からっぽの星で', src: song1Url },
  { name: '走り出した朝に', src: song2Url }
];

const currentSongIndex = ref(-1);
const currentSong = ref(null);
const isPlaying = ref(false);
const isLoading = ref(false);

// Audio Context & Logic
let audioContext = null;
let audioSource = null;
let audioBuffer = null;
let startTime = 0;
let pauseTime = 0; // 记录暂停时的位置

// Visualizer Config
const linesTotal = 200;
const visualizerRef = ref(null);
const lineRefs = ref([]);
let wavesData = null;
let animationFrameId = null;
let visualizerTimer = null; // 用于替代原来的 setInterval

// User's original logic adapted
const getWavesData = async (buffer, segmentLength, points) => {
  const rate = buffer.sampleRate;
  const duration = buffer.duration;
  const channelData = buffer.getChannelData(0);
  const result = [];
  const segments = Math.ceil(duration / segmentLength);

  for (let seg = 0; seg < segments; seg++) {
    const start_time = seg * segmentLength;
    if (start_time >= duration) break;
    
    const start_sample = Math.floor(start_time * rate);
    const end_sample = Math.floor(Math.min(start_time + segmentLength, duration) * rate);
    const point_samples = Math.floor((end_sample - start_sample) / points);
    
    const points_data = [];
    for (let i = 0; i < points; i++) {
        const start_seg = start_sample + i * point_samples;
        const end_seg = start_seg + point_samples;
        let sum = 0;
        // Optimization: sampling instead of full iteration for performance on large files
        const step = Math.max(1, Math.floor((end_seg - start_seg) / 10)); 
        let count = 0;
        for (let j = start_seg; j < end_seg; j += step) {
            sum += Math.abs(channelData[j] || 0);
            count++;
        }
        points_data.push(count > 0 ? sum / count : 0);
    }
    result.push(points_data);
  }
  return result;
};

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
};

const loadSong = async (index, autoPlay = true) => {
  // if (isLoading.value) return; // Allow reloading or initial loading without blocking UI visually
  
  stopAudio();
  currentSongIndex.value = index;
  currentSong.value = songs[index];
  // isLoading.value = true; // No longer needed for UI
  
  try {
    initAudio();
    const response = await fetch(songs[index].src);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Analyze data matching original code logic (0.3s chunks)
    wavesData = await getWavesData(audioBuffer, 0.3, linesTotal);
    
    // isLoading.value = false;
    if (autoPlay) {
      playAudio();
    } else {
        // Run visualizer once to set initial state if needed, or just let it sit
        // runVisualizer(); 
    }
  } catch (error) {
    console.error("Error loading audio:", error);
    // isLoading.value = false;
  }
};

const playAudio = () => {
  if (!audioBuffer || !audioContext) return;
  
  // Create source
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(audioContext.destination); // Connect to speakers
  
  // Handle start time if resuming
  const offset = pauseTime;
  audioSource.start(0, offset);
  startTime = audioContext.currentTime - offset;
  
  isPlaying.value = true;
  runVisualizer();
  
  audioSource.onended = () => {
    // Only resetting if it played to the end naturally
    if (isPlaying.value && (audioContext.currentTime - startTime >= audioBuffer.duration)) {
       isPlaying.value = false;
       pauseTime = 0;
       stopVisualizer();
    }
  };
};

const stopAudio = () => {
  if (audioSource) {
    try {
      audioSource.stop();
      audioSource.disconnect();
    } catch (e) { /* ignore */ }
    audioSource = null;
  }
  stopVisualizer();
  isPlaying.value = false;
};

const pauseAudio = () => {
  if (audioSource) {
    try {
      audioSource.stop();
      pauseTime = audioContext.currentTime - startTime;
    } catch (e) { /* ignore */ }
    audioSource = null;
  }
  stopVisualizer();
  isPlaying.value = false;
};

const togglePlay = () => {
  if (currentSongIndex.value === -1) {
    if (songs.length > 0) selectSong(0);
    return;
  }
  
  if (isPlaying.value) {
    pauseAudio();
  } else {
    // changed: Always playAudio directly as buffer should be loaded or loading
    if (!audioBuffer) {
      // Fallback if not loaded yet
      loadSong(currentSongIndex.value, true);
    } else {
      playAudio();
    }
  }
};

const selectSong = (index) => {
  if (currentSongIndex.value === index) {
      togglePlay();
      return;
  }
  pauseTime = 0; // Reset pause time for new song
  // When explicitly selecting, we Auto Play
  loadSong(index, true); 
};

// Visualizer Animation Loop
const runVisualizer = () => {
    stopVisualizer(); // Clear existing
    
    // The original code used setInterval(300ms).
    // Using 0.3s (300ms) segments for analysis matches the setInterval.
    // We synchronize it with audio playback time.
    
    // Interpolation for smoother effect
    const smoothUpdate = () => {
        if (!isPlaying.value || !wavesData) return;
        
        const currentTime = audioContext.currentTime - startTime;
        const segmentDuration = 0.3; 
        const exactIndex = currentTime / segmentDuration;
        const index = Math.floor(exactIndex);
        const nextIndex = index + 1;
        const progress = exactIndex - index;
        
        if (index >= wavesData.length) {
             // Loop or end
             // For now just clamp
             return;
        }

        const currentData = wavesData[index];
        const nextData = wavesData[nextIndex] || currentData; // Fallback to current if at end
        
        if (currentData && lineRefs.value.length === linesTotal) {
             for (let i = 0; i < linesTotal; i++) {
                 const line = lineRefs.value[i];
                 const val1 = currentData[i] || 0;
                 const val2 = nextData[i] || 0;
                 
                 // Linear interpolation
                 const val = val1 + (val2 - val1) * progress;
                 
                 // Dynamic scaling
                 const visualVal = Math.max(0, val * 5); 
                 line.style.setProperty("--s", visualVal);
             }
        }
        
        if (isPlaying.value) {
             animationFrameId = requestAnimationFrame(smoothUpdate);
        }
    };
    
    smoothUpdate();
};

const stopVisualizer = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
};

onMounted(() => {
    // Select first song by default and pre-load it WITHOUT playing
    if (songs.length > 0) {
        // Load the first song quietly so wavesData is ready
        loadSong(0, false);
    }
});

onUnmounted(() => {
    stopAudio();
    if (audioContext) {
        audioContext.close();
    }
});
</script>

<style scoped>
/* --- Core Styles Matching Blog Layout --- */

/* Staggered List Animation */
.staggered-list-enter-active,
.staggered-list-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 0.1s);
}

.staggered-list-enter-from,
.staggered-list-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}

.music-page {
  /* Using .layer-content from Blog/styles.css for base positioning */
  display: flex;
  align-items: center;
  padding: 24px;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  /* background-color: rgba(5, 5, 5, 0.4);  Very subtle overlay */
  /* Remove explicit heavy background to show grid/pixi */
}

@media (min-width: 1024px) {
  .music-page { padding: 96px; }
}

.music-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 48px;
}
@media (min-width: 1024px) {
  .music-wrapper { flex-direction: row; align-items: stretch; }
}

/* --- Left Panel: Playlist --- */
.music-left {
  width: 100%;
  display: flex;
  flex-direction: column;
}
@media (min-width: 1024px) {
  .music-left { width: 30%; justify-content: flex-start; padding-top: 48px; }
}

.playlist-header {
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
}

.header-cn {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 4px;
}

.header-en {
  font-size: 10px;
  letter-spacing: 0.5em;
  color: var(--color-accent, #22d3ee); 
  opacity: 0.6;
  text-transform: uppercase;
}

.music-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* --- Ak-style List Items (Copied/Adapted from Blog) --- */
.ak-list-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px 0;
  cursor: pointer;
  text-align: left;
  position: relative;
  opacity: 0.6;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.ak-list-item:hover, .ak-list-item.active {
  opacity: 1;
  transform: translateX(10px);
}

.item-content-row {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  gap: 16px;
}

.song-index {
  font-family: 'Space Grotesk', monospace;
  font-size: 12px;
  color: var(--color-accent, #22d3ee);
  opacity: 0.8;
}

.item-title-cn {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  flex-grow: 1;
  letter-spacing: 0.05em;
}

.ak-list-item:hover .item-title-cn,
.ak-list-item.active .item-title-cn {
  color: #fff;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.5); /* Blue glow */
}

/* Playing Indicator Mini */
.playing-indicator-mini {
  display: flex;
  gap: 2px;
  height: 12px;
  align-items: flex-end;
}
.playing-indicator-mini span {
  width: 2px;
  background: var(--color-accent, #22d3ee);
  animation: equalize 0.5s infinite alternate;
}
.playing-indicator-mini span:nth-child(2) { animation-delay: 0.1s; height: 60%; }
.playing-indicator-mini span:nth-child(3) { animation-delay: 0.2s; height: 30%; }

.item-separator {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  transform-origin: left center;
}

.ak-list-item:hover .item-separator {
  background: rgba(255, 255, 255, 0.2);
}

.ak-list-item.active .item-separator {
  background: var(--color-accent, #22d3ee);
  box-shadow: 0 0 8px var(--color-accent, #22d3ee);
  transform: scaleY(1.5);
}


/* --- Right Panel: Visualizer --- */
.music-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  /* Ensure it takes full available height in flex container */
  height: 100%; 
  min-height: 500px;
}

.visualizer-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* --- Loader --- */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-accent, #22d3ee);
  font-family: monospace;
  font-size: 12px;
  letter-spacing: 0.2em;
}
.loader {
  border: 1px solid rgba(255,255,255,0.1);
  border-top: 1px solid var(--color-accent, #22d3ee);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
}

/* --- The Visualizer --- */
.circle-visualizer {
  position: relative;
  /* Increased radius: width/height from 50vmin -> 65vmin */
  width: 65vmin;
  height: 65vmin; 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  
  /* Entrance animation for the container */
  opacity: 0;
  transform: scale(0.8);
  animation: visualize-init 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 0.2s; /* Slight delay to load after page */
}

@keyframes visualize-init {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: flex-start; /* Align to Top Edge */
  pointer-events: none;
  
  /* Use JS rotation passed via style */
}

/* Style for the Bars */
.line::after {
  content: "";
  display: block;
  /* Thinner lines: 0.4vmin -> 0.2vmin */
  width: 0.2vmin; 
  
  /* Shorter length: 10vmin -> 6vmin */
  height: 6vmin; 
  
  background-color: var(--color-accent, #22d3ee); 
  
  /* Default transform for audio reactivity */
  transform: scaleY(var(--s, 0)); /* Default 0 */
  
  transition: transform 0.3s ease; /* Matching snippet timing */
  /* Giving it a tiny base scale so it's visible as a ring initially */
  transform: scaleY(var(--s, 0.05)); 
  /* Remove fancy effects */
  box-shadow: none;
  border-radius: 0;
  opacity: 1;
}


/* Center Play Button & Info - Simplified */
.center-info {
  position: absolute;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Removed fixed width/height so it doesn't block clicks on lines if we had them. 
     The play button has its own dimensions.
  */
}

.play-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2); 
  color: rgba(255,255,255,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  /* No margin bottom */
}

.play-btn:hover {
  border-color: var(--color-accent, #22d3ee);
  color: var(--color-accent, #22d3ee);
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
  background: rgba(34, 211, 238, 0.1);
  transform: scale(1.1);
}

.icon-play { font-size: 24px; margin-left: 4px; } /* Optical center */
.icon-pause { font-size: 20px; }

.current-song-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.song-title-display {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: #fff;
  margin: 0 0 4px 0;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
}

.status-text {
  font-size: 10px;
  font-family: monospace;
  color: var(--color-accent, #22d3ee);
  letter-spacing: 0.2em;
  opacity: 0.8;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes equalize { 0% { height: 2px; } 100% { height: 100%; } }
</style>