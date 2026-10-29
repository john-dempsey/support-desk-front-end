// The page at /tickets/:ticketId, e.g. /tickets/2. useParams() reads the
// :ticketId part of the URL (the front-end's version of req.params in an
// Express route), and the page asks the API for that ticket with
// GET /tickets/:id, and for its comments with GET /tickets/:id/comments.
//
// Since Stage 3 it can also delete the ticket, and add and delete
// comments. It links to EditTicketPage to change the ticket.
//
// Since Stage 4 it only shows what the user's role can use: Edit and
// Delete for agents and admins, and a comment's Delete for its author or
// an admin. That's for the user's sake: the API still checks every
// request, whatever the page shows.
//
// Since Stage 5 it listens for notifications about this ticket (a new
// comment, a status change, ...) and offers to reload when one arrives.
//
// Since Stage 6 the useFetch hook loads the ticket and its comments.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { deleteTicket, getTicket } from '../api/tickets.api.js';
import { createComment, deleteComment, getComments } from '../api/comments.api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/authContext.js';
import { onNotification } from '../realtime/socket.js';
import StatusBadge from '../components/StatusBadge.jsx';
import CommentList from '../components/CommentList.jsx';
import CommentForm from '../components/CommentForm.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import RefreshNotice from '../components/RefreshNotice.jsx';
import PageTitle from '../components/PageTitle.jsx';
import { formatDate } from '../utils/formatDate.js';

function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  // One useFetch for each request. Both run when the page first renders,
  // so the two requests are sent at the same time. useFetch loads again
  // whenever ticketId changes, e.g. if the URL changes to another ticket.
  const {
    data: ticket,
    error: ticketError,
    isLoading: isTicketLoading,
    reload: reloadTicket,
  } = useFetch(getTicket, ticketId);
  const {
    data: comments,
    setData: setComments,
    error: commentsError,
    isLoading: areCommentsLoading,
    reload: reloadComments,
  } = useFetch(getComments, ticketId);
  // Errors from the buttons and forms, shown next to them. The comment
  // error is the whole error object, because CommentForm needs its details.
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [commentError, setCommentError] = useState(null);
  // True once a notification says this ticket has changed.
  const [hasChanged, setHasChanged] = useState(false);

  // Listen for notifications about this ticket while the page is open.
  // Only users the API tells about a change hear about it: e.g. the
  // assigned agent when the customer comments, or the customer when the
  // status changes. Anyone else (an admin, say) sees no notice.
  useEffect(() => {
    function handleNotification(notification) {
      // ticketId in the URL is a string ("2"); the notification's is a
      // number (2).
      const isAboutThisTicket = notification.ticketId === Number(ticketId);
      // A customer who has just created a ticket lands on its page, and
      // their own "Your ticket was created" arrives there. The ticket
      // hasn't changed since it loaded, so that one is ignored.
      const isNewTicket = notification.type === 'ticket.created';
      if (isAboutThisTicket && !isNewTicket) {
        setHasChanged(true);
      }
    }

    const stopListening = onNotification(handleNotification);
    return stopListening;
  }, [ticketId]);

  function handleReload() {
    setHasChanged(false);
    reloadTicket();
    reloadComments();
  }

  async function handleDeleteTicket() {
    // window.confirm() shows the browser's own OK/Cancel box, and returns
    // true for OK. Deleting can't be undone, so always ask first.
    const isConfirmed = window.confirm(`Delete the ticket "${ticket.subject}"? This can't be undone.`);
    if (!isConfirmed) {
      return;
    }

    setDeleteErrorMessage('');
    try {
      await deleteTicket(ticket.id);
      // The ticket list loads fresh from the API, so it won't include it.
      navigate('/tickets');
    } catch (error) {
      // e.g. 409: the API won't delete a ticket that still has comments.
      setDeleteErrorMessage(error.message);
    }
  }

  // Called by CommentForm. Returns true if the comment was saved, so the
  // form knows to empty its text box.
  async function handleAddComment(commentText) {
    setCommentError(null);
    try {
      const newComment = await createComment(ticket.id, commentText);
      // The API sends back the saved comment (author included), and new
      // comments always go at the end, so add it to the list we already
      // have instead of loading every comment again. A new array is made
      // with [...], never push(): React only re-renders when it's given a
      // new array, not the same one changed. It's the function form, as
      // in NotificationsPage, because this line runs after an await.
      setComments((currentComments) => [...currentComments, newComment]);
      return true;
    } catch (error) {
      setCommentError(error);
      return false;
    }
  }

  // The API's rule for comments: only the author, or an admin, may delete
  // one. CommentList calls this for each comment, to decide whether to
  // show its Delete button.
  function canDeleteComment(comment) {
    return comment.author.id === user.id || hasRole('admin');
  }

  // Called by CommentList with the comment whose Delete button was clicked.
  async function handleDeleteComment(commentToDelete) {
    const isConfirmed = window.confirm('Delete this comment? This can\'t be undone.');
    if (!isConfirmed) {
      return;
    }

    setCommentError(null);
    try {
      await deleteComment(ticket.id, commentToDelete.id);
      // A 204 sends nothing back, so remove the comment from our list here:
      // filter() makes a new array of every comment except that one.
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentToDelete.id),
      );
    } catch (error) {
      setCommentError(error);
    }
  }

  if (isTicketLoading || areCommentsLoading) {
    return <Loading message="Loading the ticket…" />;
  }

  // The page decides what each status means to the user. 404: there's no
  // ticket with that ID. 400: the API's validation rejected the ID itself
  // (e.g. /tickets/abc). Either way, there's no such ticket. Anything else
  // (the API is down, a 500, ...) is a real error.
  const isNotFound = ticketError && (ticketError.status === 404 || ticketError.status === 400);
  // Either request may have failed: show whichever error there is.
  const loadError = ticketError || commentsError;

  if (isNotFound) {
    return (
      <>
        <PageTitle title="Ticket not found" />
        <h1>Ticket not found</h1>
        <p>There's no ticket with the ID "{ticketId}".</p>
        <p>
          <Link to="/tickets">Back to all tickets</Link>
        </p>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <PageTitle title="Couldn't load the ticket" />
        <h1>Couldn't load the ticket</h1>
        <ErrorMessage message={loadError.message} />
        <p>
          <Link to="/tickets">Back to all tickets</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        <Link to="/tickets">Back to all tickets</Link>
      </p>
      {hasChanged && (
        <RefreshNotice message="This ticket has changed." onReload={handleReload} />
      )}
      <PageTitle title={ticket.subject} />
      <h1>{ticket.subject}</h1>
      <p>
        <StatusBadge status={ticket.status} />
      </p>

      {/* A description list (<dl>) pairs each label (<dt>) with its value
          (<dd>), so screen readers read them out together. */}
      <dl className="details-list">
        <dt>Ticket ID</dt>
        <dd>{ticket.id}</dd>
        <dt>Customer</dt>
        <dd>{ticket.customer.name}</dd>
        <dt>Assigned to</dt>
        <dd>{ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned'}</dd>
        <dt>Created</dt>
        <dd>{formatDate(ticket.createdAt)}</dd>
        <dt>Last updated</dt>
        <dd>{formatDate(ticket.updatedAt)}</dd>
      </dl>

      {/* Only agents and admins can change or delete a ticket.
          Edit is a link, not a button, because it goes to another page.
          The Delete button does something on this page instead. */}
      {hasRole('agent', 'admin') && (
        <div className="button-row">
          <Link to={`/tickets/${ticket.id}/edit`} className="button-link">
            Edit ticket
          </Link>
          <button type="button" className="danger-button" onClick={handleDeleteTicket}>
            Delete ticket
          </button>
        </div>
      )}
      {deleteErrorMessage && <ErrorMessage message={deleteErrorMessage} />}

      <h2>Description</h2>
      <p className="multiline-text">{ticket.description}</p>

      <h2>Comments</h2>
      <CommentList
        comments={comments}
        canDelete={canDeleteComment}
        onDelete={handleDeleteComment}
      />
      <CommentForm onSubmit={handleAddComment} error={commentError} />
    </>
  );
}

export default TicketDetailPage;
