export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) { super(message); this.status = status; }
}
export interface Tokens { accessToken: string; refreshToken: string }
export interface SessionStore { read(): Tokens | null; write(tokens: Tokens): void; clear(): void }

export function createHttpClient(baseUrl: string, store: SessionStore, transport: typeof fetch = fetch) {
  let refreshPromise: Promise<void> | null = null;
  async function send<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!baseUrl) throw new ApiError('Compus is not configured yet. Please contact the site owner.');
    let response: Response;
    try {
      response = await transport(`${baseUrl.replace(/\/$/, '')}${path}`, {
        ...options, signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
    } catch { throw new ApiError('Unable to reach Compus. Check your connection and try again.'); }
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const message = json?.message;
      throw new ApiError(Array.isArray(message) ? message.join(' ') : typeof message === 'string' ? message : `Compus could not complete the request (${response.status}). Please try again.`, response.status);
    }
    if (!json || typeof json !== 'object') throw new ApiError('Compus returned an unexpected response. Please try again.');
    return (json.data ?? json) as T;
  }
  async function refresh() {
    if (!refreshPromise) {
      const previous = store.read();
      refreshPromise = (async () => {
        if (!previous?.refreshToken) throw new ApiError('Please sign in again.', 401);
        const tokens = await send<Tokens>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: previous.refreshToken }) });
        if (!tokens.accessToken || !tokens.refreshToken) throw new ApiError('Invalid session response. Please sign in again.', 401);
        // A pending refresh must not resurrect a logged-out session.
        if (store.read()?.refreshToken !== previous.refreshToken) throw new ApiError('Session changed. Please sign in again.', 401);
        store.write(tokens);
      })().catch(error => {
        if (error instanceof ApiError && error.status === 401 && store.read()?.refreshToken === previous?.refreshToken) store.clear();
        throw error;
      }).finally(() => { refreshPromise = null; });
    }
    return refreshPromise;
  }
  async function request<T>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> {
    if (!authenticated) return send<T>(path, options);
    const current = store.read();
    if (!current) throw new ApiError('Please sign in again.', 401);
    try {
      return await send<T>(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${current.accessToken}` } });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      if (store.read()?.accessToken === current.accessToken) await refresh();
      const next = store.read();
      if (!next) throw new ApiError('Please sign in again.', 401);
      try {
        return await send<T>(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${next.accessToken}` } });
      } catch (retryError) {
        if (retryError instanceof ApiError && retryError.status === 401) store.clear();
        throw retryError;
      }
    }
  }
  return { request };
}
