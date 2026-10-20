// A message saying the data on the page is out of date, with a button to
// load it again. The ticket pages show it when a notification about their
// ticket arrives. They ask, rather than reloading by themselves, because
// reloading would throw away anything the user was halfway through
// typing, such as a comment.
// role="status" makes a screen reader announce it without interrupting.
function RefreshNotice({ message, onReload }) {
  return (
    <div role="status" className="refresh-notice">
      <p>{message}</p>
      <button type="button" onClick={onReload}>
        Reload
      </button>
    </div>
  );
}

export default RefreshNotice;
