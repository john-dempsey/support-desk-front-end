// The route table: one place to see every page in the app and the URL it
// lives at — the front-end's version of the back-end's routes/index.js.
// NavBar sits outside <Routes>, so it's shown on every page.
import { Route, Routes } from 'react-router';
import NavBar from './components/NavBar.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* TODO (your case study): add a <Route> for each new page. */}

          {/* "*" matches any URL that no other route matches. React Router
              always picks the most specific match, so order doesn't
              matter, but keeping it last makes the table easy to read. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
