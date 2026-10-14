// The page at /tickets. It loads the tickets from the API (GET /tickets)
// and passes them down to TicketList, which does the displaying. It
// follows the same pattern as Stage 0's HomePage: three pieces of state
// (the data, an error, and whether it's still loading) and one useEffect
// that fills them.
//
// TicketList hasn't changed since Stage 1. It never knew the tickets were
// hard-coded, so it doesn't need to know they come from the API now.
import { useEffect, useState } from 'react';
import { getTickets } from '../api/tickets.api.js';
import TicketList from '../components/TicketList.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function TicketListPage() {
  // null means "not loaded yet", which is different from [] ("loaded, and
  // there are none"). TicketList is only shown once this isn't null, so it
  // doesn't say "There are no tickets" while they're still on their way.
  const [tickets, setTickets] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If this page is removed from the screen before the request finishes
    // (e.g. the user clicks Home), the cleanup function below sets `ignore`
    // to true, so the late response can't update a page that's gone.
    let ignore = false;

    async function loadTickets() {
      try {
        const ticketsData = await getTickets();
        if (!ignore) {
          setTickets(ticketsData);
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

    loadTickets();

    return () => {
      ignore = true;
    };
  }, []); // [] = run once, when the page first appears

  return (
    <>
      <h1>Tickets</h1>
      {isLoading && <Loading message="Loading tickets…" />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {tickets && <TicketList tickets={tickets} />}
    </>
  );
}

export default TicketListPage;
