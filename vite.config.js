import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  base: '/EcoTrack/', 
  build: {
    outDir: 'dist', // 这会使构建的资源都进入 `dist/assets/`
    // 确保资源文件被正确命名和放置
  },// 修改基础路径
  server: {
    port: 8081, // 修改端口
    host: 'localhost',
    open: true
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ]
    }
  }
})