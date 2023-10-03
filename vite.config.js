import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  assetsInclude: ['**/*.glb'],
  define: {
    __ASSETS_URL__: JSON.stringify('/src/assets/'),
  }
});