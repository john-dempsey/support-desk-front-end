// The page at /tickets. It loads the tickets from the API (GET /tickets)
// and passes them down to TicketList, which does the displaying. Since
// Stage 6 the useFetch hook does the loading: the state and the useEffect
// that used to be written out here, following Stage 0's HomePage.
//
// Since Stage 3 the user can filter, sort and move between pages. Those
// choices live in the URL (/tickets?status=open&page=2), not in useState,
// so they survive a refresh, work with the Back button, and can be shared
// as a link. useSearchParams() reads and changes that part of the URL:
// the front-end's version of req.query in Express.
//
// Since Stage 5 it offers to reload when a notification about any ticket
// arrives, since that ticket may be in the list.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getTickets } from '../api/tickets.api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/authContext.js';
import { onNotification } from '../realtime/socket.js';
import TicketList from '../components/TicketList.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import Pagination from '../components/Pagination.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import RefreshNotice from '../components/RefreshNotice.jsx';
import PageTitle from '../components/PageTitle.jsx';

function TicketListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();
  // The same as in TicketDetailPage: true once a notification arrives.
  const [hasChanged, setHasChanged] = useState(false);

  // e.g. "status=open&page=2", or '' for plain /tickets. useFetch loads
  // again whenever this string changes, so a new filter, order or page in
  // the URL loads the matching tickets.
  const queryString = searchParams.toString();
  // getTickets() answers { tickets, meta }: one page of tickets, and the
  // API's { page, pageSize, total, totalPages } for Pagination.
  const { data: ticketPage, error, isLoading, reload } = useFetch(getTickets, queryString);

  // Any notification about a ticket might mean the list is out of date: a
  // new ticket, a new status, a new agent. (One whose ticket has been
  // deleted has a ticketId of null, and there's nothing to reload for.)
  useEffect(() => {
    function handleNotification(notification) {
      if (notification.ticketId !== null) {
        setHasChanged(true);
      }
    }

    const stopListening = onNotification(handleNotification);
    return stopListening;
  }, []);

  function handleReload() {
    setHasChanged(false);
    reload();
  }

  // The new query loads fresh tickets, so any "have changed" notice is
  // out of date too.
  function changeSearchParams(newSearchParams) {
    setHasChanged(false);
    setSearchParams(newSearchParams);
  }

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
    changeSearchParams(newSearchParams);
  }

  function handlePageChange(newPage) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage);
    changeSearchParams(newSearchParams);
  }

  return (
    <>
      <PageTitle title="Tickets" />
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

      {hasChanged && (
        <RefreshNotice message="The tickets have changed." onReload={handleReload} />
      )}
      {isLoading && <Loading message="Loading tickets…" />}
      {error && <ErrorMessage message={error.message} />}
      {ticketPage && <TicketList tickets={ticketPage.tickets} />}
      {ticketPage && (
        <Pagination
          page={ticketPage.meta.page}
          totalPages={ticketPage.meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}

export default TicketListPage;
