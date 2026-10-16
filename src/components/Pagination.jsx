// "Previous" and "Next" buttons for a list the API sends one page at a
// time. `page` and `totalPages` come straight from the API's `meta`, and
// onPageChange(newPage) lets the page decide what changing page means (for
// the ticket list, changing ?page= in the URL).
function Pagination({ page, totalPages, onPageChange }) {
  // With one page (or none), there's nothing to move between.
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="pagination">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <p>
        Page {page} of {totalPages}
      </p>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </nav>
  );
}

export default Pagination;
