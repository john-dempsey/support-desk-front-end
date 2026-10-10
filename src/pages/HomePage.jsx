// The first page: proves the front-end can reach the back-end by calling
// GET /welcome and showing the message it sends back. Every page that loads
// data follows this same pattern — three pieces of state (the data, an
// error, and whether it's still loading) and one useEffect that fills them.
import { useEffect, useState } from 'react';
import { getWelcome } from '../api/welcome.api.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function HomePage() {
  const [welcome, setWelcome] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If this page is removed from the screen (e.g. the user clicks away)
    // before the request finishes, the cleanup function below sets `ignore`
    // to true, so a late response can't update a page that's gone. React's
    // StrictMode also runs every effect twice in development, and this flag
    // is what makes that harmless.
    let ignore = false;

    async function loadWelcome() {
      try {
        const welcomeData = await getWelcome();
        if (!ignore) {
          setWelcome(welcomeData);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadWelcome();

    return () => {
      ignore = true;
    };
  }, []); // [] = run once, when the page first appears

  return (
    <>
      <h1>Welcome</h1>
      {isLoading && <Loading message="Connecting to the API…" />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {welcome && (
        <p>
          The API says: <strong>{welcome.message}</strong>
        </p>
      )}
    </>
  );
}

export default HomePage;
