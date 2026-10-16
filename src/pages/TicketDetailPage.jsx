// The page at /tickets/:ticketId, e.g. /tickets/2. useParams() reads the
// :ticketId part of the URL (the front-end's version of req.params in an
// Express route), and the page asks the API for that ticket with
// GET /tickets/:id, and for its comments with GET /tickets/:id/comments.
//
// Since Stage 3 it can also delete the ticket, and add and delete
// comments. It links to EditTicketPage to change the ticket.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { deleteTicket, getTicket } from '../api/tickets.api.js';
import { createComment, deleteComment, getComments } from '../api/comments.api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import CommentList from '../components/CommentList.jsx';
import CommentForm from '../components/CommentForm.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatDate } from '../utils/formatDate.js';

function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Errors from the buttons and forms, shown next to them. The comment
  // error is the whole error object, because CommentForm needs its details.
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    // The same `ignore` flag as TicketListPage, for the same reason: a
    // response that arrives after the page has gone must be ignored.
    let ignore = false;

    async function loadTicketAndComments() {
      try {
        // Both requests are sent at once; Promise.all() waits for both.
        const [ticketData, commentsData] = await Promise.all([
          getTicket(ticketId),
          getComments(ticketId),
        ]);
        if (!ignore) {
          setTicket(ticketData);
          setComments(commentsData);
        }
      } catch (error) {
        if (ignore) {
          return;
        }
        // The page decides what each status means to the user. 404: there's
        // no ticket with that ID. 400: the API's validation rejected the ID
        // itself (e.g. /tickets/abc). Either way, there's no such ticket.
        // Anything else (the API is down, a 500, ...) is a real error.
        if (error.status === 404 || error.status === 400) {
          setIsNotFound(true);
        } else {
          setErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTicketAndComments();

    return () => {
      ignore = true;
      // If the URL has changed to another ticket, React keeps this page on
      // the screen, so its state still describes the old ticket. Go back
      // to "loading", so nothing from the old ticket (its details, its
      // comments, a "not found" or an error) is shown while the new one
      // loads.
      setTicket(null);
      setComments([]);
      setErrorMessage('');
      setIsNotFound(false);
      setIsLoading(true);
      setDeleteErrorMessage('');
      setCommentError(null);
    };
    // ticketId is listed because the effect uses it: if the URL changes to
    // a different ticket while this page is showing, the effect runs again
    // and loads that ticket instead.
  }, [ticketId]);

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
      // new array, not the same one changed.
      setComments([...comments, newComment]);
      return true;
    } catch (error) {
      setCommentError(error);
      return false;
    }
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
      setComments(comments.filter((comment) => comment.id !== commentToDelete.id));
    } catch (error) {
      setCommentError(error);
    }
  }

  if (isLoading) {
    return <Loading message="Loading the ticket…" />;
  }

  if (isNotFound) {
    return (
      <>
        <h1>Ticket not found</h1>
        <p>There's no ticket with the ID "{ticketId}".</p>
        <p>
          <Link to="/tickets">Back to all tickets</Link>
        </p>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <h1>Couldn't load the ticket</h1>
        <ErrorMessage message={errorMessage} />
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

      {/* A link, not a button, because it goes to another page. The
          Delete button does something on this page instead. */}
      <div className="button-row">
        <Link to={`/tickets/${ticket.id}/edit`} className="button-link">
          Edit ticket
        </Link>
        <button type="button" className="danger-button" onClick={handleDeleteTicket}>
          Delete ticket
        </button>
      </div>
      {deleteErrorMessage && <ErrorMessage message={deleteErrorMessage} />}

      <h2>Description</h2>
      <p className="multiline-text">{ticket.description}</p>

      <h2>Comments</h2>
      <CommentList comments={comments} onDelete={handleDeleteComment} />
      <CommentForm onSubmit={handleAddComment} error={commentError} />
    </>
  );
}

export default TicketDetailPage;
