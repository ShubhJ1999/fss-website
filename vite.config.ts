// Vite config for the Fermion Software Solutions site.
// Single-page app, static assets in /public, GLSL shader imports via vite-plugin-glsl.
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: './',
  plugins: [glsl()],
  server: { port: 5173, open: false },
  build: { target: 'es2022', sourcemap: true }
});
