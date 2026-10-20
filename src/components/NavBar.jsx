// The navigation shown on every page (App.jsx renders it above <Routes>).
// NavLink, unlike a plain <a>, changes the page without reloading the whole
// app, and marks the link for the current page as active (see index.css).
//
// Since Stage 4 it depends on who is logged in: nobody sees Log in and
// Register; a logged-in user sees the tickets, their name and Log out;
// and only agents and admins see Tags. Hiding a link is for the user's
// sake: the API still refuses anyone who goes to /tags without the role.
//
// Since Stage 5 a logged-in user also sees Notifications, with how many
// are unread.
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/authContext.js';
import { useNotifications } from '../context/notificationsContext.js';

const APP_NAME = 'Support Desk';

// The API's role names, as a person should see them.
const ROLE_LABELS = {
  customer: 'Customer',
  agent: 'Agent',
  admin: 'Admin',
};

function NavBar() {
  const { user, hasRole, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="site-header">
      <p className="app-name">{APP_NAME}</p>
      <nav aria-label="Main">
        <ul className="nav-links">
          <li>
            {/* `end` = only active on exactly this URL. React Router
                already treats "/" that way; `end` makes it obvious. */}
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          {user && (
            <li>
              {/* No `end` here, so "Tickets" stays active on a ticket's
                  own page (/tickets/2) as well as on /tickets. */}
              <NavLink to="/tickets">Tickets</NavLink>
            </li>
          )}
          {user && (
            <li>
              <NavLink to="/notifications">
                Notifications{' '}
                {/* The count is words, not just a coloured dot, so it
                    doesn't rely on colour or a number alone.
                    aria-live="polite" makes a screen reader say it when
                    it changes, once the reader has finished speaking. */}
                <span className="unread-count" aria-live="polite">
                  ({unreadCount} unread)
                </span>
              </NavLink>
            </li>
          )}
          {hasRole('agent', 'admin') && (
            <li>
              <NavLink to="/tags">Tags</NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="user-menu">
        {user ? (
          <>
            <p className="user-name">
              {user.name} <span className="user-role">({ROLE_LABELS[user.role]})</span>
            </p>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <ul className="nav-links">
            <li>
              <NavLink to="/login">Log in</NavLink>
            </li>
            <li>
              <NavLink to="/register">Register</NavLink>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
}

export default NavBar;
