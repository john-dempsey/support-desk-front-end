// The navigation shown on every page (App.jsx renders it above <Routes>).
// NavLink, unlike a plain <a>, changes the page without reloading the whole
// app, and marks the link for the current page as active (see index.css).
import { NavLink } from 'react-router';

// TODO (your case study): change the app name, and add a link for each
// page you create, e.g. <NavLink to="/bookings">Bookings</NavLink>
const APP_NAME = 'My App';

function NavBar() {
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
        </ul>
      </nav>
    </header>
  );
}

export default NavBar;
