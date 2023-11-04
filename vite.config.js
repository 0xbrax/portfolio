// https://vitejs.dev/config/

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

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
  //assetsDir: 'src/assets',
  build: {
    assetsDir: 'src/assets',
  }
});