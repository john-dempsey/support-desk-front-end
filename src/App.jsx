// The route table: one place to see every page in the app and the URL it
// lives at — the front-end's version of the back-end's routes/index.js.
// NavBar sits outside <Routes>, so it's shown on every page.
import { Route, Routes } from 'react-router';
import NavBar from './components/NavBar.jsx';
import HomePage from './pages/HomePage.jsx';
import TicketListPage from './pages/TicketListPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import NewTicketPage from './pages/NewTicketPage.jsx';
import EditTicketPage from './pages/EditTicketPage.jsx';
import TagsPage from './pages/TagsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tickets" element={<TicketListPage />} />
          {/* ":ticketId" matches any value, like "/tickets/:id" in Express.
              The page reads it with useParams(). */}
          <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
          {/* "/tickets/new" also fits "/tickets/:ticketId", but a fixed
              word is more specific than ":ticketId", so React Router picks
              NewTicketPage. */}
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:ticketId/edit" element={<EditTicketPage />} />
          <Route path="/tags" element={<TagsPage />} />

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
