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
        wave1: resolve(__dirname, 'Wave1/index.html'),
        wave1J: resolve(__dirname, 'Wave1J/index.html'),
        wave1S: resolve(__dirname, 'Wave1S/index.html'),
        wave2: resolve(__dirname, 'Wave2/index.html'),
        wave2J: resolve(__dirname, 'Wave2J/index.html'),
        wave2S: resolve(__dirname, 'Wave2S/index.html'),
        wave3: resolve(__dirname, 'Wave3/index.html'),
        wave3J: resolve(__dirname, 'Wave3J/index.html'),
        wave3S: resolve(__dirname, 'Wave3S/index.html'),
      },
    },
  },
})