/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import type { Importer } from 'sass-embedded';
// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
    rollupOptions: {
      input: 'index.html'
    }
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      inlineStylesExtension: 'scss',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'legacy'
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
