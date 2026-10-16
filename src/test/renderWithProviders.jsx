// A test helper for rendering anything that uses routing (<Link>,
// <NavLink>, useParams(), ...) or the logged-in user (useAuth()). In the
// real app, main.jsx provides both: <BrowserRouter> and <AuthProvider>.
// In tests, MemoryRouter starts at whatever URL the test asks for, and a
// fake auth value says who is "logged in", without any requests.
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthContext } from '../context/authContext.js';
import { adminUser } from './testUsers.js';

// The same shape AuthProvider provides. login, register and logout are
// fakes, so a test can check they were called.
function createFakeAuth(user) {
  return {
    user,
    isCheckingSession: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasRole: (...roles) => user !== null && roles.includes(user.role),
  };
}

// `route` is the URL to start at. `path` is only needed for pages that read
// part of the URL with useParams(): it's the same pattern as the page's
// <Route> in App.jsx (e.g. '/tickets/:ticketId'), so the page can find out
// which ticket the URL asks for.
// `user` is who is logged in: Ada, an admin, unless the test says
// otherwise, so every control is shown as in Stage 3. Pass `user: null`
// for nobody.
// Returns the fake auth value as `auth`, e.g. to check auth.logout was
// called.
export function renderWithProviders(
  componentToTest,
  { route = '/', path, user = adminUser } = {},
) {
  let content = componentToTest;
  if (path) {
    content = (
      <Routes>
        <Route path={path} element={componentToTest} />
      </Routes>
    );
  }

  const auth = createFakeAuth(user);
  const result = render(
    <AuthContext value={auth}>
      <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
    </AuthContext>,
  );
  return { ...result, auth };
}
