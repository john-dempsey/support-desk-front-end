// Checks each function in auth.api.js asks for the right URL with the
// right body, with apiRequest() faked as in tickets.api.test.js.
import { describe, expect, it, vi } from 'vitest';
import { getCurrentUser, login, register } from './auth.api.js';
import { apiRequest } from './client.js';

vi.mock('./client.js');

const loginResult = { user: { id: 1, name: 'Casey Customer' }, token: 'a-token' };

describe('auth.api', () => {
  it('login() sends POST /auth/login and returns the user and token', async () => {
    apiRequest.mockResolvedValue({ data: loginResult });

    const result = await login('casey@example.com', 'password123');

    expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'casey@example.com', password: 'password123' },
    });
    expect(result).toEqual(loginResult);
  });

  it('register() sends POST /auth/register with the name, email and password', async () => {
    apiRequest.mockResolvedValue({ data: loginResult });

    await register('Casey Customer', 'casey@example.com', 'password123');

    expect(apiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Casey Customer', email: 'casey@example.com', password: 'password123' },
    });
  });

  it('getCurrentUser() calls GET /auth/me and returns the user', async () => {
    apiRequest.mockResolvedValue({ data: loginResult.user });

    const result = await getCurrentUser();

    expect(apiRequest).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(loginResult.user);
  });
});
