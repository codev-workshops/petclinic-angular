import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/playwright',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html']],
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200' },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
