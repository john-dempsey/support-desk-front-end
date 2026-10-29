// Tests the register form, in the same way as LoginPage.test.jsx.
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import RegisterPage from './RegisterPage.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { customerUser } from '../test/testUsers.js';

function renderRegisterPage() {
  return renderWithProviders(<RegisterPage />, { route: '/register', user: null });
}

async function fillInAndSubmit() {
  await userEvent.type(screen.getByLabelText('Name'), 'Sam Student');
  await userEvent.type(screen.getByLabelText('Email'), 'sam@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('RegisterPage', () => {
  it('sends the name, email and password to register()', async () => {
    const { auth } = renderRegisterPage();

    await fillInAndSubmit();

    expect(auth.register).toHaveBeenCalledWith('Sam Student', 'sam@example.com', 'password123');
  });

  it('names the browser tab after the page', () => {
    renderRegisterPage();

    expect(document.title).toBe('Create an account · Support Desk');
  });

  it("shows the API's validation details next to the right field", async () => {
    const { auth } = renderRegisterPage();
    const validationError = new Error('Validation failed');
    validationError.status = 400;
    validationError.details = [
      { field: 'password', message: 'password must be at least 8 characters' },
    ];
    auth.register.mockRejectedValue(validationError);

    await fillInAndSubmit();

    expect(await screen.findByText('password must be at least 8 characters')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('says so when the email already has an account', async () => {
    const { auth } = renderRegisterPage();
    const conflictError = new Error('A record with that User_email_key already exists');
    conflictError.status = 409;
    auth.register.mockRejectedValue(conflictError);

    await fillInAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with that email already exists',
    );
  });

  it('sends a logged-in user to the ticket list', () => {
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tickets" element={<h1>Ticket list</h1>} />
      </Routes>,
      { route: '/register', user: customerUser },
    );

    expect(screen.getByRole('heading', { name: 'Ticket list' })).toBeInTheDocument();
  });
});
