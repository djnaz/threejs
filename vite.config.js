import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wave0: resolve(__dirname, 'Wave0/index.html'),
        wave0J: resolve(__dirname, 'Wave0J/index.html'),
        wave0S: resolve(__dirname, 'Wave0S/index.html'),
      },
    },
  },
})