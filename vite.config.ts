// Vite config for the Fermion Software Solutions site.
// Single-page app, static assets in /public, no special plugins needed.
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5173, open: false },
  build: { target: 'es2022', sourcemap: true }
});
