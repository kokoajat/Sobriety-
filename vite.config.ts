import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so a build can be opened from disk or served from any subpath;
  // there is no backend to host it under.
  base: './',
  build: {
    // app.html, not index.html: the repository root's index.html is the
    // published build output, so the source template has to live elsewhere or
    // GitHub Pages would serve this untranspiled template instead of the app.
    rollupOptions: { input: 'app.html' },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
