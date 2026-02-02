import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // 优化构建配置
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 核心库单独打包
          'vue-vendor': ['vue', 'vue-router'],
          // 将 Pixi.js 单独打包
          'pixi-vendor': ['pixi.js']
        }
      }
    },
    // 提高 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  // 优化开发服务器
  server: {
    fs: {
      // 允许访问项目根目录外的文件
      strict: false
    }
  }
})
