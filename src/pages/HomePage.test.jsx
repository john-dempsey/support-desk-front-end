// HomePage no longer calls the API, so there's nothing to mock. It does
// contain a <Link>, so it's rendered inside a router.
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import HomePage from './HomePage.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

describe('HomePage', () => {
  it('shows a welcome heading', () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Welcome to Support Desk' }),
    ).toBeInTheDocument();
  });

  it('names the browser tab after the page', () => {
    renderWithProviders(<HomePage />);

    expect(document.title).toBe('Home · Support Desk');
  });

  it('links to the ticket list', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByRole('link', { name: 'View the tickets' })).toHaveAttribute(
      'href',
      '/tickets',
    );
  });

  it('asks a visitor who is not logged in to log in or register', () => {
    renderWithProviders(<HomePage />, { user: null });

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'create an account' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(screen.queryByRole('link', { name: 'View the tickets' })).not.toBeInTheDocument();
  });
});
