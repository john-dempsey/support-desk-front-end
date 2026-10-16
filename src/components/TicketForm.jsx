// The form for a ticket, used by two pages: NewTicketPage (to create one)
// and EditTicketPage (to change one). The form only looks after what's
// typed into it. The page decides what to do with the values (POST or
// PATCH), and passes back any error the API sends.
//
// Props:
//   initialValues: what the inputs start with: { subject, description,
//                  status, assignedAgentId }. Empty for a new ticket.
//   agents:        the agents to choose from. Only EditTicketPage passes
//                  this, and only then does the form show "Status" and
//                  "Assigned to": a new ticket is always open and
//                  unassigned.
//   submitLabel:   the button's text, e.g. "Create ticket"
//   onSubmit:      the page's function that sends the values to the API
//   error:         the error the API sent back last time, or null
import { useState } from 'react';
import ErrorMessage from './ErrorMessage.jsx';
import FieldError from './FieldError.jsx';
import { getFieldError } from '../utils/getFieldError.js';
import { STATUS_LABELS, TICKET_STATUSES } from '../utils/ticketStatuses.js';

const EMPTY_TICKET = { subject: '', description: '', status: 'open', assignedAgentId: '' };

function TicketForm({ initialValues = EMPTY_TICKET, agents, submitLabel, onSubmit, error }) {
  // Controlled inputs: each input shows a piece of state, and typing into
  // it updates that state. So the current values are always in state, ready
  // to send. (A Blade form leaves them in the inputs until it's posted.)
  const [subject, setSubject] = useState(initialValues.subject);
  const [description, setDescription] = useState(initialValues.description);
  const [status, setStatus] = useState(initialValues.status);
  // A <select>'s value is always a string. '' means "Unassigned".
  const [assignedAgentId, setAssignedAgentId] = useState(initialValues.assignedAgentId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    // Stops the browser sending the form and reloading the page, as a Blade
    // form would. React sends the values to the API itself instead.
    event.preventDefault();

    let values = { subject, description };
    if (agents) {
      // Turn the <select>'s string back into what the API expects: a
      // number, or null for "Unassigned".
      let agentIdToSend = null;
      if (assignedAgentId !== '') {
        agentIdToSend = Number(assignedAgentId);
      }
      values = { subject, description, status, assignedAgentId: agentIdToSend };
    }

    // The button is disabled until the request has finished, so a
    // double-click can't send the same ticket twice.
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  }

  const subjectError = getFieldError(error, 'subject');
  const descriptionError = getFieldError(error, 'description');

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error.message} />}

      <div className="form-field">
        <label htmlFor="ticket-subject">Subject</label>
        {/* required and maxLength match the back-end's Zod rules, so most
            mistakes are caught before a request is sent. The API still
            checks everything, and its `details` are shown below. */}
        <input
          id="ticket-subject"
          type="text"
          required
          maxLength={200}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          aria-invalid={Boolean(subjectError)}
          aria-describedby={subjectError ? 'ticket-subject-error' : undefined}
        />
        <FieldError id="ticket-subject-error" message={subjectError} />
      </div>

      <div className="form-field">
        <label htmlFor="ticket-description">Description</label>
        <textarea
          id="ticket-description"
          rows={5}
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={Boolean(descriptionError)}
          aria-describedby={descriptionError ? 'ticket-description-error' : undefined}
        />
        <FieldError id="ticket-description-error" message={descriptionError} />
      </div>

      {agents && (
        <>
          <div className="form-field">
            <label htmlFor="ticket-status">Status</label>
            <select
              id="ticket-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {TICKET_STATUSES.map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {STATUS_LABELS[statusValue]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="ticket-agent">Assigned to</label>
            <select
              id="ticket-agent"
              value={assignedAgentId}
              onChange={(event) => setAssignedAgentId(event.target.value)}
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

export default TicketForm;
