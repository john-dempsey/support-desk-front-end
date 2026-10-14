// Tests apiRequest() on its own, with a fake fetch() instead of a real
// back-end — so these tests run without the API running, and can create
// situations (a 400, a network failure) that are hard to cause on demand.
import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from './client.js';

// A fake fetch() that answers every request with the given status and JSON
// body. Only the parts of a real Response that apiRequest() reads are faked.
function fakeFetchResponding(status, body) {
  const fakeFetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fakeFetch);
  return fakeFetch;
}

describe('apiRequest', () => {
  it('returns the response body on success', async () => {
    fakeFetchResponding(200, { data: { message: 'Hello world!' } });

    const responseBody = await apiRequest('/welcome');

    expect(responseBody).toEqual({ data: { message: 'Hello world!' } });
  });

  it('calls the API base URL with the given path', async () => {
    const fakeFetch = fakeFetchResponding(200, { data: {} });

    await apiRequest('/welcome');

    const requestedUrl = fakeFetch.mock.calls[0][0];
    expect(requestedUrl).toBe('http://localhost:3000/welcome');
  });

  it('sends a body as JSON', async () => {
    const fakeFetch = fakeFetchResponding(201, { data: { id: 1 } });

    await apiRequest('/bookings', { method: 'POST', body: { name: 'Sam' } });

    const requestOptions = fakeFetch.mock.calls[0][1];
    expect(requestOptions.method).toBe('POST');
    expect(requestOptions.headers['Content-Type']).toBe('application/json');
    expect(requestOptions.body).toBe('{"name":"Sam"}');
  });

  it('sends no Authorization header when there is no token', async () => {
    // Vitest reads your .env too, so without this the test would see your
    // real VITE_DEV_TOKEN. stubEnv() replaces it for this test only.
    vi.stubEnv('VITE_DEV_TOKEN', '');
    const fakeFetch = fakeFetchResponding(200, { data: {} });

    await apiRequest('/welcome');

    const requestOptions = fakeFetch.mock.calls[0][1];
    expect(requestOptions.headers.Authorization).toBeUndefined();
  });

  it('sends the token as a Bearer Authorization header', async () => {
    vi.stubEnv('VITE_DEV_TOKEN', 'test-token');
    const fakeFetch = fakeFetchResponding(200, { data: {} });

    await apiRequest('/welcome');

    const requestOptions = fakeFetch.mock.calls[0][1];
    expect(requestOptions.headers.Authorization).toBe('Bearer test-token');
  });

  it('returns null for 204 No Content', async () => {
    fakeFetchResponding(204, undefined);

    const responseBody = await apiRequest('/bookings/1', { method: 'DELETE' });

    expect(responseBody).toBeNull();
  });

  it("throws the back-end's error message, status and details", async () => {
    const details = [{ field: 'name', message: 'name is required' }];
    fakeFetchResponding(400, { error: { message: 'Validation failed', details } });

    // rejects.toMatchObject checks the thrown error has these properties.
    await expect(apiRequest('/bookings', { method: 'POST', body: {} })).rejects.toMatchObject({
      message: 'Validation failed',
      status: 400,
      details,
    });
  });

  it('throws a helpful message when the API cannot be reached', async () => {
    // A rejected fetch() is what happens when nothing answers at all.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiRequest('/welcome')).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining("Can't reach the API"),
    });
  });
});
