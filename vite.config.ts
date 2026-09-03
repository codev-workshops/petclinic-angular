import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React app served under the same context path as the Angular app (/petclinic/).
export default defineConfig({
  base: '/petclinic/',
  plugins: [react()],
  publicDir: false,
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
