// Tests the three things ProtectedRoute can do: send a visitor to the
// login page, turn away the wrong role, or show the page. A plain heading
// stands in for the protected page, and another for the login page.
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { agentUser, customerUser } from '../test/testUsers.js';

function renderTagsRouteAs(user) {
  renderWithProviders(
    <Routes>
      <Route
        path="/tags"
        element={
          <ProtectedRoute allowedRoles={['agent', 'admin']}>
            <h1>Tags page</h1>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<h1>Login page</h1>} />
    </Routes>,
    { route: '/tags', user },
  );
}

describe('ProtectedRoute', () => {
  it('sends a visitor who is not logged in to the login page', () => {
    renderTagsRouteAs(null);

    expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument();
  });

  it("tells a user without the role that the page isn't for them", () => {
    renderTagsRouteAs(customerUser);

    expect(screen.getByRole('heading', { name: 'Not available' })).toBeInTheDocument();
    expect(document.title).toBe('Not available · Support Desk');
    expect(screen.queryByRole('heading', { name: 'Tags page' })).not.toBeInTheDocument();
  });

  it('shows the page to a user with one of the roles', () => {
    renderTagsRouteAs(agentUser);

    expect(screen.getByRole('heading', { name: 'Tags page' })).toBeInTheDocument();
  });
});
