// Vite config for the Fermion Software Solutions site.
// Multi-page setup: index + case studies + 404. GLSL plugin for shader imports.
import { defineConfig } from 'vite';
import { resolve } from 'path';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: './',
  plugins: [glsl({
    include: ['**/*.glsl', '**/*.vert', '**/*.frag', '**/*.vs', '**/*.fs']
  })],
  server: { port: 5173, open: false },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        caseOne: resolve(__dirname, 'pages/case-one.html'),
        caseTwo: resolve(__dirname, 'pages/case-two.html'),
        caseThree: resolve(__dirname, 'pages/case-three.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
});
