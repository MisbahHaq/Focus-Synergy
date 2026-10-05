import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'frontend',
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'frontend/index.html'),
        dashboard: path.resolve(__dirname, 'frontend/dashboard.html'),
      },
    },
  },
  server: {
    port: 5173,
    // Tauri owns the window and requires the exact devUrl port.
    strictPort: true,
    open: false,
    proxy: {
      '/__/auth': {
        target: 'https://timetable-a3aa5.firebaseapp.com',
        changeOrigin: true,
      },
    },
  },
});
