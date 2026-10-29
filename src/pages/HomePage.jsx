// The page at /. In Stage 0 it called the back-end's GET /welcome to prove
// the two could talk. Since Stage 1 it's a plain welcome page that points
// the user to the tickets, and since Stage 4 it asks a visitor who isn't
// logged in to log in first.
import { Link } from 'react-router';
import { useAuth } from '../context/authContext.js';
import PageTitle from '../components/PageTitle.jsx';

function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <PageTitle title="Home" />
      <h1>Welcome to Support Desk</h1>
      <p>Report a problem, follow its progress, and see every ticket in one place.</p>
      {user ? (
        <p>
          <Link to="/tickets">View the tickets</Link>
        </p>
      ) : (
        <p>
          <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to
          get started.
        </p>
      )}
    </>
  );
}

export default HomePage;
