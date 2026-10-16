// The four statuses a ticket can have, and the words a person should see
// for each. The API's values are written for code ("in_progress"). Several
// files need this list (StatusBadge, the status filter, the ticket form),
// so it lives here once and they can never disagree.

// In the order they're shown in a dropdown.
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};
