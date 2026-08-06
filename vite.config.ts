import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'web',
  base: '/petclinic/',
  plugins: [react()],
  server: {
    port: 4200,
  },
  build: {
    outDir: '../dist-react',
  },
});
