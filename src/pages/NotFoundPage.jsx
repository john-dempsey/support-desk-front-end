// Shown for any URL that doesn't match a route in App.jsx — the front-end's
// version of the back-end's middleware/notFound.js.
import { Link } from 'react-router';
import PageTitle from '../components/PageTitle.jsx';

function NotFoundPage() {
  return (
    <>
      <PageTitle title="Page not found" />
      <h1>Page not found</h1>
      <p>Sorry, there's no page at this address.</p>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </>
  );
}

export default NotFoundPage;
