// https://vitejs.dev/config/

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_');

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
    publicPath: mode === 'production' ? env.VUE_APP_BASE_URL : '/',
  }
});