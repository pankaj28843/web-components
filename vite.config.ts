import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: null,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
    lib: {
      entry: fileURLToPath(new URL('./src/share.ts', import.meta.url)),
      name: 'WebComponents',
      formats: ['es', 'iife'],
      fileName: (format) => (format === 'es' ? 'share.js' : 'share.iife.js'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    clearMocks: true,
    restoreMocks: true,
    reporters: ['default'],
  },
});
