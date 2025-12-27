import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({// 修改基础路径
  server: {
    port: 8081, // 修改端口
    host: 'localhost',
    open: true
  },
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' 
    ? '/EcoTrack/'  // 替换为你的仓库名
    : '/',
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