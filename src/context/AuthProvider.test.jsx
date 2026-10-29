// Tests the real AuthProvider (not the fake one renderWithProviders uses),
// with auth.api.js faked. A tiny component, ShowAuth, displays what
// useAuth() gives it, so each test can check the provider's value on the
// screen, the same way a real component would see it.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthProvider from './AuthProvider.jsx';
import { useAuth } from './authContext.js';
import { getCurrentUser, login, register } from '../api/auth.api.js';
import { apiRequest } from '../api/client.js';
import { getSavedToken, saveToken } from '../api/tokenStorage.js';
import { customerUser } from '../test/testUsers.js';

vi.mock('../api/auth.api.js');

function ShowAuth() {
  const auth = useAuth();

  if (auth.isCheckingSession) {
    return <p>Checking…</p>;
  }

  return (
    <>
      <p>{auth.user ? `Logged in as ${auth.user.name}` : 'Logged out'}</p>
      <button type="button" onClick={() => auth.login('casey@example.com', 'password123')}>
        Log in
      </button>
      <button
        type="button"
        onClick={() => auth.register('Casey Customer', 'casey@example.com', 'password123')}
      >
        Register
      </button>
      <button type="button" onClick={auth.logout}>
        Log out
      </button>
    </>
  );
}

function renderAuthProvider() {
  render(
    <AuthProvider>
      <ShowAuth />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  it("starts logged out, without asking the API, when there's no saved token", () => {
    renderAuthProvider();

    expect(screen.getByText('Logged out')).toBeInTheDocument();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('checks a saved token with GET /auth/me, and logs that user in', async () => {
    saveToken('saved-token');
    getCurrentUser.mockResolvedValue(customerUser);

    renderAuthProvider();

    expect(screen.getByText('Checking…')).toBeInTheDocument();
    expect(await screen.findByText('Logged in as Casey Customer')).toBeInTheDocument();
  });

  it('forgets a saved token the API rejects', async () => {
    saveToken('expired-token');
    const expiredError = new Error('Invalid or expired token');
    expiredError.status = 401;
    getCurrentUser.mockRejectedValue(expiredError);

    renderAuthProvider();

    expect(await screen.findByText('Logged out')).toBeInTheDocument();
    expect(getSavedToken()).toBeNull();
  });

  it('login() saves the token and logs the user in', async () => {
    login.mockResolvedValue({ user: customerUser, token: 'new-token' });
    renderAuthProvider();

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Logged in as Casey Customer')).toBeInTheDocument();
    expect(getSavedToken()).toBe('new-token');
  });

  it('register() saves the token and logs the new user in', async () => {
    register.mockResolvedValue({ user: customerUser, token: 'new-token' });
    renderAuthProvider();

    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(register).toHaveBeenCalledWith('Casey Customer', 'casey@example.com', 'password123');
    expect(await screen.findByText('Logged in as Casey Customer')).toBeInTheDocument();
    expect(getSavedToken()).toBe('new-token');
  });

  it('logout() forgets the token and logs the user out', async () => {
    login.mockResolvedValue({ user: customerUser, token: 'new-token' });
    renderAuthProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await screen.findByText('Logged in as Casey Customer');

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(screen.getByText('Logged out')).toBeInTheDocument();
    expect(getSavedToken()).toBeNull();
  });

  it('logs the user out when any later request gets a 401', async () => {
    login.mockResolvedValue({ user: customerUser, token: 'new-token' });
    renderAuthProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await screen.findByText('Logged in as Casey Customer');
    // The real apiRequest(), with a fake fetch() that answers 401.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid or expired token' } }),
      }),
    );

    await expect(apiRequest('/tickets')).rejects.toMatchObject({ status: 401 });

    expect(await screen.findByText('Logged out')).toBeInTheDocument();
    expect(getSavedToken()).toBeNull();
  });
});
