import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VUE_APP_");
  return {
    plugins: [
      vue()
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    assetsInclude: ['**/*.glb'],
    base: process.env.NODE_ENV === 'production' ? env.BASE_URL : '/',
  }
});