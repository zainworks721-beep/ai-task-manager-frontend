import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET =
  process.env.VITE_API_PROXY_TARGET ||
  'https://ai-task-manager-backend-production-4622.up.railway.app';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Proxying keeps local development free of CORS allowlist issues and
    // works on any port. Production uses VITE_API_URL (or the fallback).
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
