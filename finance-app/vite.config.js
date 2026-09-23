import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react()],
  // Inject VITE_USE_MOCK as a compile-time constant accessible as __VITE_USE_MOCK__
  // in src/services/financeService.js (avoids import.meta which Jest can't parse).
  define: {
    __VITE_USE_MOCK__: JSON.stringify(env.VITE_USE_MOCK ?? 'true'),
  },
  server: {
    port: 3000,
    // Proxy API requests to the local Express server during development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  };
});
