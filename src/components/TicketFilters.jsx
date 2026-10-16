// The dropdowns above the ticket list: filter by status, and choose how to
// sort. It only shows the current choices and reports a change through
// onChange(name, value). TicketListPage keeps the choices in the URL.
//
// The names passed to onChange ('status', 'sortBy', 'order') are the API's
// own query parameter names, so the page can pass them straight through.
import { STATUS_LABELS, TICKET_STATUSES } from '../utils/ticketStatuses.js';

function TicketFilters({ status, sortBy, order, onChange }) {
  return (
    <div className="filters">
      <div className="form-field">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={status}
          onChange={(event) => onChange('status', event.target.value)}
        >
          <option value="">All statuses</option>
          {TICKET_STATUSES.map((statusValue) => (
            <option key={statusValue} value={statusValue}>
              {STATUS_LABELS[statusValue]}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="filter-sort-by">Sort by</label>
        <select
          id="filter-sort-by"
          value={sortBy}
          onChange={(event) => onChange('sortBy', event.target.value)}
        >
          <option value="createdAt">Date created</option>
          <option value="updatedAt">Last updated</option>
          <option value="subject">Subject</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="filter-order">Order</label>
        <select
          id="filter-order"
          value={order}
          onChange={(event) => onChange('order', event.target.value)}
        >
          <option value="desc">Descending (newest, Z to A)</option>
          <option value="asc">Ascending (oldest, A to Z)</option>
        </select>
      </div>
    </div>
  );
}

export default TicketFilters;
