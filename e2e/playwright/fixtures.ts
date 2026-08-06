import { test as base, expect } from '@playwright/test';
import { ApiRecorder, installMockApi } from './mock/route';
import { createStore } from './mock/store';

export const test = base.extend<{ api: ApiRecorder }>({
  api: [async ({ page }, use) => {
    const store = createStore();
    const api = await installMockApi(page, store);
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));
    await use(api);
    expect(errors, `uncaught page errors: ${errors.map((error) => error.message).join('; ')}`).toEqual([]);
  }, { auto: true }],
});
export { expect };
