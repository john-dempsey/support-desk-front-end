// Shared by every page that waits for the API, so "loading" looks and
// behaves the same everywhere. role="status" makes screen readers announce
// the message without interrupting the user.
function Loading({ message = 'Loading…' }) {
  return (
    <p role="status" className="loading">
      {message}
    </p>
  );
}

export default Loading;
