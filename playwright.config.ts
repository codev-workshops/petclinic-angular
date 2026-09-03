import { defineConfig, devices } from '@playwright/test';

/**
 * Parity harness: the journeys in `e2e/journeys` were written against the Angular app (the
 * oracle) and run against the React app under `/petclinic/`, talking to the
 * spring-petclinic-rest backend on http://localhost:9966/petclinic/api/.
 *
 * Set REACT_BASE_URL to point at an already running server (e.g. `npm run preview` on 4173
 * or the Docker image on 8080); otherwise `npm run dev` is started automatically.
 * `e2e/__screenshots__/angular/` holds the historical Angular screenshots used by
 * `npm run test:e2e:visual-diff`.
 */
export const REACT_BASE_URL = process.env.REACT_BASE_URL ?? 'http://localhost:5173/petclinic/';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:9966/petclinic/api';

export default defineConfig({
  testDir: './e2e/journeys',
  outputDir: './e2e/.tmp/test-results',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'e2e/.tmp/playwright-report', open: 'never' }], ['json', { outputFile: 'e2e/.tmp/results.json' }]]
    : [['list'], ['json', { outputFile: 'e2e/.tmp/results.json' }]],
  use: {
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'react', use: { ...devices['Desktop Chrome'], baseURL: REACT_BASE_URL } }],
  webServer: process.env.REACT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: REACT_BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
