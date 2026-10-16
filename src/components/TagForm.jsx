// A one-field form for a tag's name. TagsPage uses it twice: to add a tag,
// and to rename one. As in CommentForm, onSubmit returns true when the API
// saved the tag, and only then is the input emptied.
//
// Props:
//   inputId:     a unique id for the input. Both forms can be on the page
//                at once, and every id on a page must be different.
//   label:       the input's label, e.g. "New tag name"
//   initialName: what the input starts with ('' for a new tag)
//   submitLabel: the button's text
//   onSubmit:    the page's function that sends the name to the API
//   onCancel:    optional. If given, a Cancel button is shown.
//   error:       the error the API sent back last time, or null
import { useState } from 'react';
import ErrorMessage from './ErrorMessage.jsx';
import FieldError from './FieldError.jsx';
import { getFieldError } from '../utils/getFieldError.js';

function TagForm({ inputId, label, initialName = '', submitLabel, onSubmit, onCancel, error }) {
  const [name, setName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    const isSaved = await onSubmit(name);
    setIsSubmitting(false);

    if (isSaved) {
      setName('');
    }
  }

  const nameError = getFieldError(error, 'name');
  const errorId = `${inputId}-error`;

  return (
    <form className="form tag-form" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error.message} />}

      <div className="form-field">
        <label htmlFor={inputId}>{label}</label>
        {/* maxLength 50 matches the back-end's rule for a tag's name. */}
        <input
          id={inputId}
          type="text"
          required
          maxLength={50}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? errorId : undefined}
        />
        <FieldError id={errorId} message={nameError} />
      </div>

      <div className="button-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TagForm;
