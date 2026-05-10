// Playwright config for end-to-end smoke tests against the built preview.
// Boots `npm run preview` automatically; tests live in tests/*.spec.ts.

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    timeout: 60_000
  },
  use: { baseURL: 'http://localhost:4173' }
});
