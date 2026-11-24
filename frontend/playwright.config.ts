import { defineConfig } from '@playwright/test';

// Requires the API (localhost:4000) and frontend dev server (localhost:5175)
// running. Test users get unique emails; no fixtures are destroyed.
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5175',
    headless: true,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
