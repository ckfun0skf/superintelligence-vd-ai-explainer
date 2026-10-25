import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        transformerAttention: resolve(process.cwd(), 'series/transformer-attention/index.html'),
      },
    },
  },
});
