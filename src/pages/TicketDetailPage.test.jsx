// TicketDetailPage reads the ticket's ID from the URL with useParams(), so
// each test passes both the URL to visit (`route`) and the route pattern
// the page lives at in App.jsx (`path`). Both API modules the page uses
// are faked, as in TicketListPage.test.jsx, and so is the socket.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router';
import TicketDetailPage from './TicketDetailPage.jsx';
import { deleteTicket, getTicket } from '../api/tickets.api.js';
import { createComment, deleteComment, getComments } from '../api/comments.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { ticketAssignedToAlex, unassignedTicket } from '../test/testTickets.js';
import { testComments } from '../test/testComments.js';
import { agentUser, customerUser } from '../test/testUsers.js';
import { commentPush } from '../test/testNotifications.js';
import { captureNotificationHandler } from '../test/fakeSocket.js';

vi.mock('../api/tickets.api.js');
vi.mock('../api/comments.api.js');
vi.mock('../realtime/socket.js');

const DETAIL_PATH = '/tickets/:ticketId';

// The same kind of error apiRequest() throws: a message plus the status.
function createApiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function renderPageAt(url) {
  renderWithProviders(<TicketDetailPage />, { route: url, path: DETAIL_PATH });
}

// Shows ticket 1 with its two comments, and waits until it's on screen.
async function renderTicketWithComments() {
  getTicket.mockResolvedValue(ticketAssignedToAlex);
  getComments.mockResolvedValue(testComments);
  renderPageAt('/tickets/1');
  await screen.findByRole('heading', { level: 1, name: 'Cannot log in' });
}

// The page asks before deleting anything. window.confirm() is replaced
// with a fake that answers OK (true) or Cancel (false).
function answerConfirmWith(answer) {
  vi.spyOn(window, 'confirm').mockReturnValue(answer);
}

describe('TicketDetailPage', () => {
  // Most tests don't care about comments, so "the API" sends none unless
  // a test says otherwise.
  beforeEach(() => {
    getComments.mockResolvedValue([]);
  });

  it('asks the API for the ticket whose ID is in the URL, and its comments', () => {
    getTicket.mockReturnValue(new Promise(() => {}));

    renderPageAt('/tickets/2');

    expect(getTicket).toHaveBeenCalledWith('2');
    expect(getComments).toHaveBeenCalledWith('2');
  });

  it('shows a loading message while waiting for the API', () => {
    getTicket.mockReturnValue(new Promise(() => {}));

    renderPageAt('/tickets/2');

    expect(screen.getByRole('status')).toHaveTextContent('Loading the ticket');
  });

  it('shows the ticket from the API', async () => {
    getTicket.mockResolvedValue(unassignedTicket);

    renderPageAt('/tickets/2');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Invoice discrepancy' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Charged twice for March')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('No comments yet.')).toBeInTheDocument();
  });

  it('shows "Ticket not found" when the API answers 404', async () => {
    getTicket.mockRejectedValue(createApiError(404, 'Ticket 999 not found'));

    renderPageAt('/tickets/999');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ticket not found' }),
    ).toBeInTheDocument();
  });

  it('shows "Ticket not found" when the API rejects the ID with 400', async () => {
    getTicket.mockRejectedValue(createApiError(400, 'Validation failed'));

    renderPageAt('/tickets/abc');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ticket not found' }),
    ).toBeInTheDocument();
  });

  it("shows the API's error message for any other error", async () => {
    getTicket.mockRejectedValue(createApiError(0, "Can't reach the API"));

    renderPageAt('/tickets/2');

    expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach the API");
  });

  it('shows the new ticket when the URL changes from a ticket that was not found', async () => {
    // Ticket 999 doesn't exist; ticket 2 does.
    getTicket.mockImplementation(async (ticketId) => {
      if (ticketId === '999') {
        throw createApiError(404, 'Ticket 999 not found');
      }
      return unassignedTicket;
    });
    // The link sits next to the page, inside the same route, so clicking
    // it changes the URL while the same TicketDetailPage stays on screen.
    renderWithProviders(
      <>
        <Link to="/tickets/2">Go to ticket 2</Link>
        <TicketDetailPage />
      </>,
      { route: '/tickets/999', path: DETAIL_PATH },
    );
    await screen.findByRole('heading', { level: 1, name: 'Ticket not found' });

    await userEvent.click(screen.getByRole('link', { name: 'Go to ticket 2' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Invoice discrepancy' }),
    ).toBeInTheDocument();
  });

  it('links back to the ticket list, and to the edit page', async () => {
    getTicket.mockResolvedValue(unassignedTicket);

    renderPageAt('/tickets/2');

    expect(await screen.findByRole('link', { name: 'Back to all tickets' })).toHaveAttribute(
      'href',
      '/tickets',
    );
    expect(screen.getByRole('link', { name: 'Edit ticket' })).toHaveAttribute(
      'href',
      '/tickets/2/edit',
    );
  });

  describe('deleting the ticket', () => {
    // After deleting, the page goes to /tickets, so there's a stand-in
    // route for it to land on.
    async function renderDeletableTicket() {
      getTicket.mockResolvedValue(ticketAssignedToAlex);
      renderWithProviders(
        <Routes>
          <Route path={DETAIL_PATH} element={<TicketDetailPage />} />
          <Route path="/tickets" element={<h1>Ticket list</h1>} />
        </Routes>,
        { route: '/tickets/1' },
      );
      await screen.findByRole('heading', { level: 1, name: 'Cannot log in' });
    }

    it('deletes the ticket and goes back to the list when confirmed', async () => {
      answerConfirmWith(true);
      deleteTicket.mockResolvedValue();
      await renderDeletableTicket();

      await userEvent.click(screen.getByRole('button', { name: 'Delete ticket' }));

      expect(deleteTicket).toHaveBeenCalledWith(1);
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Ticket list' }),
      ).toBeInTheDocument();
    });

    it('does nothing when the user cancels', async () => {
      answerConfirmWith(false);
      await renderDeletableTicket();

      await userEvent.click(screen.getByRole('button', { name: 'Delete ticket' }));

      expect(deleteTicket).not.toHaveBeenCalled();
    });

    it("shows the API's message when it refuses (409)", async () => {
      answerConfirmWith(true);
      deleteTicket.mockRejectedValue(
        createApiError(409, 'This record cannot be deleted or changed because other records still depend on it'),
      );
      await renderDeletableTicket();

      await userEvent.click(screen.getByRole('button', { name: 'Delete ticket' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('cannot be deleted');
    });
  });

  describe('controls by role', () => {
    it("doesn't show a customer Edit or Delete", async () => {
      getTicket.mockResolvedValue(ticketAssignedToAlex);

      renderWithProviders(<TicketDetailPage />, {
        route: '/tickets/1',
        path: DETAIL_PATH,
        user: customerUser,
      });
      await screen.findByRole('heading', { level: 1, name: 'Cannot log in' });

      expect(screen.queryByRole('link', { name: 'Edit ticket' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete ticket' })).not.toBeInTheDocument();
    });

    it('shows an agent Edit and Delete', async () => {
      getTicket.mockResolvedValue(ticketAssignedToAlex);

      renderWithProviders(<TicketDetailPage />, {
        route: '/tickets/1',
        path: DETAIL_PATH,
        user: agentUser,
      });

      expect(await screen.findByRole('link', { name: 'Edit ticket' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete ticket' })).toBeInTheDocument();
    });
  });

  describe('comments', () => {
    it("shows the ticket's comments with their authors", async () => {
      await renderTicketWithComments();

      const commentItems = screen.getAllByRole('listitem');
      expect(commentItems).toHaveLength(2);
      expect(within(commentItems[0]).getByText('Alex Agent')).toBeInTheDocument();
      expect(within(commentItems[0]).getByText('Have you checked your spam folder?')).toBeInTheDocument();
    });

    it('adds a new comment to the list and empties the box', async () => {
      const newComment = {
        id: 3,
        body: 'Fixed, thanks!',
        author: { id: 1, name: 'Casey Customer', email: 'casey@example.com' },
        createdAt: '2026-10-08T12:00:00.000Z',
      };
      createComment.mockResolvedValue(newComment);
      await renderTicketWithComments();

      await userEvent.type(screen.getByLabelText('Add a comment'), 'Fixed, thanks!');
      await userEvent.click(screen.getByRole('button', { name: 'Add comment' }));

      expect(createComment).toHaveBeenCalledWith(1, 'Fixed, thanks!');
      expect(await screen.findByText('Fixed, thanks!')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByLabelText('Add a comment')).toHaveValue('');
    });

    it("keeps the text and shows the API's details when a comment is rejected", async () => {
      const validationError = createApiError(400, 'Validation failed');
      validationError.details = [{ field: 'body', message: 'body is required' }];
      createComment.mockRejectedValue(validationError);
      await renderTicketWithComments();

      await userEvent.type(screen.getByLabelText('Add a comment'), '   ');
      await userEvent.click(screen.getByRole('button', { name: 'Add comment' }));

      expect(await screen.findByText('body is required')).toBeInTheDocument();
      expect(screen.getByLabelText('Add a comment')).toHaveValue('   ');
    });

    it('removes a comment when its Delete button is clicked and confirmed', async () => {
      answerConfirmWith(true);
      deleteComment.mockResolvedValue();
      await renderTicketWithComments();

      await userEvent.click(screen.getByRole('button', { name: 'Delete comment by Alex Agent' }));

      expect(deleteComment).toHaveBeenCalledWith(1, 1);
      expect(screen.queryByText('Have you checked your spam folder?')).not.toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('only offers Delete on your own comments', async () => {
      getTicket.mockResolvedValue(ticketAssignedToAlex);
      getComments.mockResolvedValue(testComments);

      // Casey wrote the second comment; Alex wrote the first.
      renderWithProviders(<TicketDetailPage />, {
        route: '/tickets/1',
        path: DETAIL_PATH,
        user: customerUser,
      });
      await screen.findByRole('heading', { level: 1, name: 'Cannot log in' });

      expect(
        screen.getByRole('button', { name: 'Delete comment by Casey Customer' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Delete comment by Alex Agent' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when a notification arrives', () => {
    // Alex is looking at ticket 1, which is assigned to them.
    async function renderTicketForAlex() {
      getTicket.mockResolvedValue(ticketAssignedToAlex);
      const socket = captureNotificationHandler();
      renderWithProviders(<TicketDetailPage />, {
        route: '/tickets/1',
        path: DETAIL_PATH,
        user: agentUser,
      });
      await screen.findByRole('heading', { level: 1, name: 'Cannot log in' });
      return socket;
    }

    it('says the ticket has changed when the notification is about it', async () => {
      const socket = await renderTicketForAlex();

      // Casey has commented on ticket 1.
      await socket.push(commentPush);

      expect(screen.getByRole('status')).toHaveTextContent('This ticket has changed.');
    });

    it('says nothing for a notification about another ticket', async () => {
      const socket = await renderTicketForAlex();

      await socket.push({ ...commentPush, ticketId: 2 });

      expect(screen.queryByText('This ticket has changed.')).not.toBeInTheDocument();
    });

    it('says nothing for "ticket created", even about this ticket', async () => {
      const socket = await renderTicketForAlex();

      await socket.push({ ...commentPush, type: 'ticket.created' });

      expect(screen.queryByText('This ticket has changed.')).not.toBeInTheDocument();
    });

    it('loads the ticket and comments again when Reload is clicked', async () => {
      const socket = await renderTicketForAlex();
      await socket.push(commentPush);
      getComments.mockResolvedValue(testComments);

      await userEvent.click(screen.getByRole('button', { name: 'Reload' }));

      expect(await screen.findByText('Yes, it is not there either.')).toBeInTheDocument();
      expect(getTicket).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('This ticket has changed.')).not.toBeInTheDocument();
    });
  });
});
