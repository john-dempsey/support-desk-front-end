// NavBar shows different links depending on who is logged in, so each
// test renders it as a different user.
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavBar from './NavBar.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { agentUser, customerUser } from '../test/testUsers.js';

describe('NavBar', () => {
  it('offers Log in and Register to a visitor', () => {
    renderWithProviders(<NavBar />, { user: null });

    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tickets' })).not.toBeInTheDocument();
  });

  it("shows a customer the tickets and their name, but not Tags", () => {
    renderWithProviders(<NavBar />, { user: customerUser });

    expect(screen.getByRole('link', { name: 'Tickets' })).toBeInTheDocument();
    expect(screen.getByText('Casey Customer')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tags' })).not.toBeInTheDocument();
  });

  it('shows an agent the Tags link', () => {
    renderWithProviders(<NavBar />, { user: agentUser });

    expect(screen.getByRole('link', { name: 'Tags' })).toBeInTheDocument();
  });

  it('shows a logged-in user how many notifications are unread', () => {
    renderWithProviders(<NavBar />, { user: customerUser, unreadCount: 3 });

    expect(screen.getByRole('link', { name: 'Notifications (3 unread)' })).toHaveAttribute(
      'href',
      '/notifications',
    );
  });

  it("doesn't offer a visitor notifications", () => {
    renderWithProviders(<NavBar />, { user: null });

    expect(screen.queryByRole('link', { name: /Notifications/ })).not.toBeInTheDocument();
  });

  it('logs out when Log out is clicked', async () => {
    const { auth } = renderWithProviders(<NavBar />, { user: customerUser });

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(auth.logout).toHaveBeenCalled();
  });
});
