import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  server: { allowedHosts: ['5173-i6ej9mw22zqvl7le6qm1w-e0b5812a.us1.manus.computer'] },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        transformerAttention: resolve(process.cwd(), 'series/transformer-attention/index.html'),
        neuralNetworks: resolve(process.cwd(), 'series/neural-networks/index.html'),
      },
    },
  },
});
