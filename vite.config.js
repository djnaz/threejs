import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wave01: resolve(__dirname, 'wave01a/index.html'),
        // wave02: resolve(__dirname, 'wave01b/index.html'),
      },
    },
  },
})