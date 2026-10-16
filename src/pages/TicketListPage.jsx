// The page at /tickets. It loads the tickets from the API (GET /tickets)
// and passes them down to TicketList, which does the displaying. It
// follows the same pattern as Stage 0's HomePage: pieces of state (the
// data, an error, and whether it's still loading) and one useEffect that
// fills them.
//
// Since Stage 3 the user can filter, sort and move between pages. Those
// choices live in the URL (/tickets?status=open&page=2), not in useState,
// so they survive a refresh, work with the Back button, and can be shared
// as a link. useSearchParams() reads and changes that part of the URL:
// the front-end's version of req.query in Express.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getTickets } from '../api/tickets.api.js';
import { useAuth } from '../context/authContext.js';
import TicketList from '../components/TicketList.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import Pagination from '../components/Pagination.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function TicketListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();
  // null means "not loaded yet", which is different from [] ("loaded, and
  // there are none"). TicketList is only shown once this isn't null, so it
  // doesn't say "There are no tickets" while they're still on their way.
  const [tickets, setTickets] = useState(null);
  // The API's { page, pageSize, total, totalPages }, for Pagination.
  const [meta, setMeta] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // e.g. "status=open&page=2", or '' for plain /tickets. The effect depends
  // on this string, so it runs again whenever the query in the URL changes.
  const queryString = searchParams.toString();

  useEffect(() => {
    // If the query changes (or the user leaves the page) before this
    // request finishes, the cleanup function below sets `ignore` to true.
    // So a slow, out-of-date response can't replace the tickets of a newer
    // one: e.g. after choosing "Open" and then quickly "Closed", the page
    // can only ever show the closed tickets.
    let ignore = false;

    async function loadTickets() {
      try {
        const result = await getTickets(queryString);
        if (!ignore) {
          setTickets(result.tickets);
          setMeta(result.meta);
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
      // As in TicketDetailPage: go back to "loading" while the tickets for
      // the new query are on their way, so an old error or the old page of
      // tickets isn't shown in the meantime.
      setTickets(null);
      setMeta(null);
      setErrorMessage('');
      setIsLoading(true);
    };
  }, [queryString]);

  // Called by TicketFilters, e.g. handleFilterChange('status', 'open').
  function handleFilterChange(name, value) {
    // searchParams belongs to React Router, so it isn't changed directly.
    // Make a copy, change the copy, and hand it to setSearchParams(), the
    // same way state is never changed directly.
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(name, value);
    } else {
      // "All statuses" is '': leave status out of the URL altogether.
      newSearchParams.delete(name);
    }
    // A different filter or order starts again from page 1.
    newSearchParams.delete('page');
    setSearchParams(newSearchParams);
  }

  function handlePageChange(newPage) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage);
    setSearchParams(newSearchParams);
  }

  return (
    <>
      <h1>Tickets</h1>
      {/* Only customers can report a problem (the API's
          authorize('customer')), so only they get the link. */}
      {hasRole('customer') && (
        <p>
          <Link to="/tickets/new" className="button-link">
            New ticket
          </Link>
        </p>
      )}

      {/* A missing value means "use the API's default", so the dropdowns
          show the same defaults the API uses: newest first. */}
      <TicketFilters
        status={searchParams.get('status') || ''}
        sortBy={searchParams.get('sortBy') || 'createdAt'}
        order={searchParams.get('order') || 'desc'}
        onChange={handleFilterChange}
      />

      {isLoading && <Loading message="Loading tickets…" />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {tickets && <TicketList tickets={tickets} />}
      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}

export default TicketListPage;
