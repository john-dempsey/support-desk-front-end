// The route table: one place to see every page in the app and the URL it
// lives at — the front-end's version of the back-end's routes/index.js.
// NavBar sits outside <Routes>, so it's shown on every page.
//
// Since Stage 4, most pages are wrapped in <ProtectedRoute>, just as the
// back-end's routes are wrapped in authenticate and authorize(...).
//
// Since Stage 6, an ErrorBoundary around the routes shows "Something went
// wrong" if a page crashes, instead of a blank screen, and a "Skip to main
// content" link lets keyboard users jump past NavBar.
import { Route, Routes, useLocation } from 'react-router';
import { useAuth } from './context/authContext.js';
import NavBar from './components/NavBar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Loading from './components/Loading.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TicketListPage from './pages/TicketListPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import NewTicketPage from './pages/NewTicketPage.jsx';
import EditTicketPage from './pages/EditTicketPage.jsx';
import TagsPage from './pages/TagsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  const { isCheckingSession } = useAuth();
  const location = useLocation();

  // While a saved token is being checked, nobody knows yet whether the
  // user is logged in. Showing the routes now would make ProtectedRoute
  // send a logged-in user to /login for a moment, so wait.
  if (isCheckingSession) {
    return (
      <main className="container">
        <Loading message="Checking your session…" />
      </main>
    );
  }

  return (
    <>
      {/* The first thing a keyboard user reaches with Tab, so they can jump
          past the navigation links on every page. It's hidden until it has
          focus (see .skip-link in index.css). */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <NavBar />
      <main id="main-content" className="container">
        {/* NavBar is outside the boundary, so it still works after a crash.
            key: React swaps in a new ErrorBoundary whenever the path
            changes, so going to another page clears the error. Without it,
            "Something went wrong" would stay on every page. */}
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Any logged-in user. */}
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <TicketListPage />
                </ProtectedRoute>
              }
            />
            {/* ":ticketId" matches any value, like "/tickets/:id" in Express.
                The page reads it with useParams(). */}
            <Route
              path="/tickets/:ticketId"
              element={
                <ProtectedRoute>
                  <TicketDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* "/tickets/new" also fits "/tickets/:ticketId", but a fixed
                word is more specific than ":ticketId", so React Router picks
                NewTicketPage. Only customers report problems, as in the
                back-end's authorize('customer'). */}
            <Route
              path="/tickets/new"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <NewTicketPage />
                </ProtectedRoute>
              }
            />

            {/* Only agents and admins change tickets and tags. */}
            <Route
              path="/tickets/:ticketId/edit"
              element={
                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                  <EditTicketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tags"
              element={
                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                  <TagsPage />
                </ProtectedRoute>
              }
            />

            {/* "*" matches any URL that no other route matches. React Router
                always picks the most specific match, so order doesn't
                matter, but keeping it last makes the table easy to read. */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </>
  );
}

export default App;
