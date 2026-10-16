// The "Add a comment" box under a ticket. Like TicketForm, it only looks
// after what's typed. TicketDetailPage's onSubmit sends it to the API and
// returns true if the comment was saved, so the box is only emptied then:
// if saving fails, the user's text isn't lost.
import { useState } from 'react';
import ErrorMessage from './ErrorMessage.jsx';
import FieldError from './FieldError.jsx';
import { getFieldError } from '../utils/getFieldError.js';

function CommentForm({ onSubmit, error }) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    const isSaved = await onSubmit(commentText);
    setIsSubmitting(false);

    if (isSaved) {
      setCommentText('');
    }
  }

  // The API calls the comment's text `body`, so that's the field name in
  // its validation details.
  const textError = getFieldError(error, 'body');

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error.message} />}

      <div className="form-field">
        <label htmlFor="comment-text">Add a comment</label>
        <textarea
          id="comment-text"
          rows={3}
          required
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          aria-invalid={Boolean(textError)}
          aria-describedby={textError ? 'comment-text-error' : undefined}
        />
        <FieldError id="comment-text-error" message={textError} />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Add comment'}
      </button>
    </form>
  );
}

export default CommentForm;
