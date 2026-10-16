// Wraps a page that needs a logged-in user, in App.jsx's route table:
//   <ProtectedRoute><TicketListPage /></ProtectedRoute>
// `children` is whatever is written between the tags, here the page.
//
// - Nobody logged in: go to the login page. (After logging in, everyone
//   starts at the ticket list; see LoginPage.)
// - allowedRoles given, and the user has none of them: say so, instead of
//   showing a page whose every request would fail. It's the front-end's
//   version of the back-end's authorize('agent', 'admin').
//
// This is for the user's sake, not for security. Anyone could still send
// the requests with a REST client; the API checks every one of them.
import { Link, Navigate } from 'react-router';
import { useAuth } from '../context/authContext.js';

function ProtectedRoute({ allowedRoles, children }) {
  const { user, hasRole } = useAuth();

  if (!user) {
    // `replace` swaps this URL for /login in the browser's history, so the
    // Back button doesn't bring the user straight back here.
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <>
        <h1>Not available</h1>
        <p>Your account can't use this page.</p>
        <p>
          <Link to="/tickets">Go to the tickets</Link>
        </p>
      </>
    );
  }

  return children;
}

export default ProtectedRoute;
