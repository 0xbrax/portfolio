import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import restart from 'vite-plugin-restart';
import glsl from 'vite-plugin-glsl'



export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return tag === 'swiper-container' || tag === 'swiper-slide';
          },
        },
      },
    }),
    restart({ restart: [ '../public/**', ] }),
    glsl()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true
  },
})
