import { defineConfig, devices } from '@playwright/test';

/**
 * Parity harness: the same journeys in `e2e/journeys` run against the Angular app and
 * the React app, both under `/petclinic/` and both talking to the spring-petclinic-rest
 * backend on http://localhost:9966/petclinic/api/.
 *
 *   TARGET=react   (default)  -> project "react"   @ http://localhost:5173/petclinic/ (vite)
 *   TARGET=angular            -> project "angular" @ http://localhost:4200/petclinic/ (ng serve)
 *   TARGET=both               -> both projects
 *
 * Set REACT_BASE_URL / ANGULAR_BASE_URL to point at an already running server
 * (e.g. `npm run preview` on 4173 or the Docker image on 8080).
 */
export type Target = 'angular' | 'react';

const target = (process.env.TARGET ?? 'react').toLowerCase();
const wantAngular = target === 'angular' || target === 'both';
const wantReact = target === 'react' || target === 'both';

export const REACT_BASE_URL = process.env.REACT_BASE_URL ?? 'http://localhost:5173/petclinic/';
export const ANGULAR_BASE_URL = process.env.ANGULAR_BASE_URL ?? 'http://localhost:4200/petclinic/';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:9966/petclinic/api';

const projects = [];
if (wantAngular) {
  projects.push({ name: 'angular', use: { ...devices['Desktop Chrome'], baseURL: ANGULAR_BASE_URL } });
}
if (wantReact) {
  projects.push({ name: 'react', use: { ...devices['Desktop Chrome'], baseURL: REACT_BASE_URL } });
}

const webServer = [];
if (wantAngular && !process.env.ANGULAR_BASE_URL) {
  webServer.push({
    command: 'npm run ng:start',
    url: ANGULAR_BASE_URL,
    reuseExistingServer: true,
    timeout: 240_000,
  });
}
if (wantReact && !process.env.REACT_BASE_URL) {
  webServer.push({
    command: 'npm run dev',
    url: REACT_BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  });
}

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
  projects,
  webServer,
});
