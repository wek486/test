import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 默认隐藏开发工具浮层，避免遮挡手机底栏；需要时设置 EXIX_DEVTOOLS=true。
export default defineConfig({
  plugins: [vue(), ...(process.env.EXIX_DEVTOOLS === 'true' ? [vueDevTools()] : [])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
