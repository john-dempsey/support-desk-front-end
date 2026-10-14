// The API sends every date as an ISO string, e.g. "2026-10-08T09:15:00.000Z".
// That's good for computers but hard for people to read, so every page that
// shows a date passes it through this one function. The browser's built-in
// Intl.DateTimeFormat does the formatting, so no date library is needed.

// Created once and reused, rather than on every call. 'en-IE' gives Irish
// formatting, e.g. "8 Oct 2026, 10:15", in the user's own time zone.
const dateFormatter = new Intl.DateTimeFormat('en-IE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDate(isoString) {
  const date = new Date(isoString);

  // new Date() doesn't throw for a bad string; it gives an "Invalid Date"
  // whose time is NaN. Without this check, format() would throw and the
  // whole page would crash because of one bad date.
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return dateFormatter.format(date);
}
