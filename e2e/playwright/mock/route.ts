import { Page } from '@playwright/test';
import { handleApi } from './handler';
import { Store } from './store';

export type RecordedRequest = { method: string; url: string; body?: unknown };
export type ApiReply = { status: number; headers?: Record<string, string>; body?: unknown };
export type ApiRecorder = {
  requests: RecordedRequest[];
  override: (method: string, urlSuffix: string, reply: ApiReply) => void;
};
export async function installMockApi(page: Page, store: Store): Promise<ApiRecorder> {
  const requests: RecordedRequest[] = [];
  const overrides: Array<{ method: string; urlSuffix: string; reply: ApiReply }> = [];
  await page.route('http://localhost:9966/petclinic/api/**', async (route) => {
    const request = route.request();
    const method = request.method();
    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': '*' } });
      return;
    }
    let body: unknown;
    try { body = request.postDataJSON(); } catch { body = undefined; }
    requests.push({ method, url: request.url(), body });
    const override = overrides.find((item) => item.method === method && request.url().endsWith(item.urlSuffix));
    const overridden = override?.reply;
    if (overridden) {
      await route.fulfill({ status: overridden.status, headers: { 'access-control-allow-origin': '*', ...(overridden.headers || {}) }, body: typeof overridden.body === 'string' ? overridden.body : JSON.stringify(overridden.body ?? {}) });
      return;
    }
    const url = new URL(request.url());
    const prefix = '/petclinic/api/';
    const reply = handleApi(method, url.pathname.slice(prefix.length), url.searchParams, body, store);
    const headers = { 'access-control-allow-origin': '*', ...(reply.headers || {}) };
    await route.fulfill({ status: reply.status, headers, body: typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body ?? {}) });
  });
  return { requests, override: (method, urlSuffix, reply) => overrides.push({ method, urlSuffix, reply }) };
}
