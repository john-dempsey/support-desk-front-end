// Tests the login form: what it sends, where it goes once logged in, and
// the API's errors. The fake auth value from renderWithProviders stands in
// for AuthProvider, so `auth.login` is a vi.fn() the test controls.
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import LoginPage from './LoginPage.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { customerUser } from '../test/testUsers.js';

function createApiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Nobody is logged in, so the login form shows.
function renderLoginPage() {
  return renderWithProviders(<LoginPage />, { route: '/login', user: null });
}

async function fillInAndSubmit() {
  await userEvent.type(screen.getByLabelText('Email'), 'casey@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('LoginPage', () => {
  it('sends the email and password to login()', async () => {
    const { auth } = renderLoginPage();

    await fillInAndSubmit();

    expect(auth.login).toHaveBeenCalledWith('casey@example.com', 'password123');
  });

  it("shows the API's message for a wrong email or password", async () => {
    const { auth } = renderLoginPage();
    auth.login.mockRejectedValue(createApiError(401, 'Invalid email or password'));

    await fillInAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });

  it('asks the user to wait after too many attempts', async () => {
    const { auth } = renderLoginPage();
    auth.login.mockRejectedValue(createApiError(429, 'Too many requests'));

    await fillInAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Wait a few minutes');
  });

  it('sends a logged-in user to the ticket list', () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tickets" element={<h1>Ticket list</h1>} />
      </Routes>,
      { route: '/login', user: customerUser },
    );

    expect(screen.getByRole('heading', { name: 'Ticket list' })).toBeInTheDocument();
  });
});
