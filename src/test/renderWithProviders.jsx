// A test helper for rendering anything that uses routing (<Link>,
// <NavLink>, useParams(), ...), the logged-in user (useAuth()) or the
// unread count (useNotifications()). In the real app, main.jsx provides
// all three: <BrowserRouter>, <AuthProvider> and <NotificationsProvider>.
// In tests, MemoryRouter starts at whatever URL the test asks for, and
// fake auth and notifications values say who is "logged in" and how many
// notifications they haven't read, without any requests.
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthContext } from '../context/authContext.js';
import { NotificationsContext } from '../context/notificationsContext.js';
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

// The same shape NotificationsProvider provides, with a fake
// refreshUnreadCount, so a test can check it was called.
function createFakeNotifications(unreadCount) {
  return {
    unreadCount,
    refreshUnreadCount: vi.fn(),
  };
}

// `route` is the URL to start at. `path` is only needed for pages that read
// part of the URL with useParams(): it's the same pattern as the page's
// <Route> in App.jsx (e.g. '/tickets/:ticketId'), so the page can find out
// which ticket the URL asks for.
// `user` is who is logged in: Ada, an admin, unless the test says
// otherwise, so every control is shown as in Stage 3. Pass `user: null`
// for nobody.
// `unreadCount` is how many unread notifications NavBar shows (0 unless
// the test says otherwise).
// Returns the fake values as `auth` and `notifications`, e.g. to check
// auth.logout or notifications.refreshUnreadCount was called.
export function renderWithProviders(
  componentToTest,
  { route = '/', path, user = adminUser, unreadCount = 0 } = {},
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
  const notifications = createFakeNotifications(unreadCount);
  const result = render(
    <AuthContext value={auth}>
      <NotificationsContext value={notifications}>
        <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
      </NotificationsContext>
    </AuthContext>,
  );
  return { ...result, auth, notifications };
}
