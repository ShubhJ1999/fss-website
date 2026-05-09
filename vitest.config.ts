// Vitest config — runs unit tests under tests/ in a happy-dom environment.
// Kept separate from vite.config.ts so prod build stays untouched.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts']
  }
});
