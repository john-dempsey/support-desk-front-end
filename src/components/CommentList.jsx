// Shows a ticket's comments, oldest first, with a Delete button on each
// one the user may delete. Like TicketList, it just displays what it's
// given: TicketDetailPage owns the comments, decides who may delete which
// (canDelete), and does the deleting (onDelete).
import { formatDate } from '../utils/formatDate.js';

function CommentList({ comments, canDelete, onDelete }) {
  if (comments.length === 0) {
    return <p>No comments yet.</p>;
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li key={comment.id} className="comment">
          <p className="comment-meta">
            <strong>{comment.author.name}</strong>, {formatDate(comment.createdAt)}
          </p>
          <p className="multiline-text">{comment.body}</p>
          {/* Many comments can have a "Delete" button, so aria-label gives
              each one a name a screen reader user can tell apart. It
              starts with the visible word, so voice control ("click
              Delete") still works. */}
          {canDelete(comment) && (
            <button
              type="button"
              className="danger-button"
              aria-label={`Delete comment by ${comment.author.name}`}
              onClick={() => onDelete(comment)}
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
