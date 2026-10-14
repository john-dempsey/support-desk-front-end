// Shows a ticket's status as a coloured label. It always shows the status
// as text too, never just a colour, so it still makes sense to someone who
// can't tell the colours apart or is using a screen reader.
import styles from './StatusBadge.module.css';

// The API's status values are written for code ("in_progress"). These are
// the words a person should see instead.
const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

function StatusBadge({ status }) {
  // If the API ever sends a status this file doesn't know about, show it
  // as it is, in grey, rather than showing nothing.
  const label = STATUS_LABELS[status] || status;
  const colourClass = styles[status] || styles.unknown;

  return <span className={`${styles.badge} ${colourClass}`}>{label}</span>;
}

export default StatusBadge;
