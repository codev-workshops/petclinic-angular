import { defineConfig } from '@playwright/test';

/** E2E / parity harness (Wave 3). `npm run test:e2e` expects `npm run dev` to be reachable. */
export default defineConfig({
  testDir: './e2e-react',
  use: {
    baseURL: 'http://localhost:5173/petclinic/',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/petclinic/',
    reuseExistingServer: true,
  },
});
