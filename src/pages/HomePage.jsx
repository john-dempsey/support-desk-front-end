// The page at /. In Stage 0 it called the back-end's GET /welcome to prove
// the two could talk. That check has done its job, and from Stage 2 the
// ticket pages talk to the API themselves, so it's now a plain welcome page
// that points the user to the tickets.
import { Link } from 'react-router';

function HomePage() {
  return (
    <>
      <h1>Welcome to Support Desk</h1>
      <p>Report a problem, follow its progress, and see every ticket in one place.</p>
      <p>
        <Link to="/tickets">View the tickets</Link>
      </p>
    </>
  );
}

export default HomePage;
