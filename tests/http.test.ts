import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHttpClient, ApiError, type Tokens } from '../src/services/http.ts';

function fixture(transport: typeof fetch) {
  let tokens: Tokens | null = { accessToken: 'old', refreshToken: 'refresh' };
  const store = { read: () => tokens, write: (next: Tokens) => { tokens = next; }, clear: () => { tokens = null; } };
  return { store, client: createHttpClient('https://api.example.test/api/v1', store, transport) };
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('concurrent expired requests share one refresh and retry with the new token', async () => {
  let refreshes = 0;
  const { client, store } = fixture(async (url, options) => {
    if (String(url).endsWith('/auth/refresh')) { refreshes++; return json({ data: { accessToken: 'new', refreshToken: 'rotated' } }); }
    return (options?.headers as Record<string, string>).Authorization === 'Bearer new' ? json({ data: { id: 'student' } }) : json({ message: 'Expired' }, 401);
  });
  const result = await Promise.all([client.request('/auth/me', {}, true), client.request('/auth/me', {}, true)]);
  assert.equal(refreshes, 1); assert.deepEqual(result, [{ id: 'student' }, { id: 'student' }]); assert.equal(store.read()?.refreshToken, 'rotated');
});
test('invalid refresh clears authentication', async () => {
  const { client, store } = fixture(async () => json({ message: 'Revoked' }, 401));
  await assert.rejects(client.request('/auth/me', {}, true), (e: ApiError) => e.status === 401);
  assert.equal(store.read(), null);
});
test('outages surface an error and preserve tokens for a retry', async () => {
  const { client, store } = fixture(async () => { throw new TypeError('network'); });
  await assert.rejects(client.request('/auth/me', {}, true), /Unable to reach Compus/);
  assert.equal(store.read()?.accessToken, 'old');
});
test('a refresh finishing after logout cannot restore a session', async () => {
  let complete!: (value: Response) => void;
  let started!: () => void;
  const entered = new Promise<void>(resolve => { started = resolve; });
  const { client, store } = fixture(async url => {
    if (String(url).endsWith('/auth/refresh')) { started(); return new Promise(resolve => { complete = resolve; }); }
    return json({}, 401);
  });
  const pending = client.request('/auth/me', {}, true);
  await entered; store.clear(); complete(json({ accessToken: 'new', refreshToken: 'new-refresh' }));
  await assert.rejects(pending); assert.equal(store.read(), null);
});
test('validation errors are readable and HTML deployment failures never appear successful', async () => {
  const { client } = fixture(async () => json({ message: ['Name required', 'Six digits required'] }, 400));
  await assert.rejects(client.request('/auth/register-with-otp'), /Name required Six digits required/);
  const bad = fixture(async () => new Response('<html>not found</html>', { status: 404 }));
  await assert.rejects(bad.client.request('/auth/login'), /404/);
});
test('missing production API configuration fails before a request', async () => {
  const { store } = fixture(fetch);
  const client = createHttpClient('', store, async () => { throw new Error('must not fetch'); });
  await assert.rejects(client.request('/auth/login'), /not configured/);
});
