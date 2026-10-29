// Tests NotificationsPage's states (loading, error, empty, the list),
// marking a notification as read, and a pushed notification arriving
// while the page is open. The API module and the socket are both faked.
import { describe, expect, it, vi } from 'vitest';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsPage from './NotificationsPage.jsx';
import { getNotifications, markNotificationRead } from '../api/notifications.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { captureNotificationHandler } from '../test/fakeSocket.js';
import { agentUser } from '../test/testUsers.js';
import {
  commentPush,
  readNotification,
  testNotifications,
  unreadNotification,
} from '../test/testNotifications.js';

vi.mock('../api/notifications.api.js');
vi.mock('../realtime/socket.js');

function renderPage() {
  return renderWithProviders(<NotificationsPage />, {
    route: '/notifications',
    user: agentUser,
  });
}

describe('NotificationsPage', () => {
  it('shows a loading message while waiting for the API', () => {
    getNotifications.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Loading notifications');
  });

  it('names the browser tab after the page', () => {
    getNotifications.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(document.title).toBe('Notifications · Support Desk');
  });

  it("shows the API's error message when the request fails", async () => {
    getNotifications.mockRejectedValue(new Error("Can't reach the API"));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach the API");
  });

  it('says so when there are no notifications', async () => {
    getNotifications.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('You have no notifications.')).toBeInTheDocument();
  });

  it('shows each notification, marking the unread ones "New"', async () => {
    getNotifications.mockResolvedValue(testNotifications);

    renderPage();

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Ticket #1 was assigned to you')).toBeInTheDocument();
    expect(within(items[0]).getByText('New')).toBeInTheDocument();
    expect(within(items[1]).queryByText('New')).not.toBeInTheDocument();
  });

  it('links to the ticket, unless the ticket has been deleted', async () => {
    getNotifications.mockResolvedValue(testNotifications);

    renderPage();

    const items = await screen.findAllByRole('listitem');
    expect(within(items[0]).getByRole('link', { name: 'View ticket' })).toHaveAttribute(
      'href',
      '/tickets/1',
    );
    // readNotification's ticket was deleted (ticketId: null).
    expect(within(items[1]).queryByRole('link')).not.toBeInTheDocument();
  });

  it('offers "Mark as read" only on unread notifications', async () => {
    getNotifications.mockResolvedValue(testNotifications);

    renderPage();

    const items = await screen.findAllByRole('listitem');
    expect(within(items[0]).getByRole('button', { name: /Mark as read/ })).toBeInTheDocument();
    expect(within(items[1]).queryByRole('button')).not.toBeInTheDocument();
  });

  it('marks a notification as read, and refreshes the unread count', async () => {
    getNotifications.mockResolvedValue([unreadNotification]);
    markNotificationRead.mockResolvedValue({
      ...unreadNotification,
      readAt: '2026-10-08T12:00:00.000Z',
    });
    const { notifications } = renderPage();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Mark as read: Ticket #1 was assigned to you' }),
    );

    expect(markNotificationRead).toHaveBeenCalledWith(7);
    expect(screen.queryByText('New')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mark as read/ })).not.toBeInTheDocument();
    expect(notifications.refreshUnreadCount).toHaveBeenCalled();
  });

  it("shows the API's message if marking as read fails", async () => {
    getNotifications.mockResolvedValue([unreadNotification]);
    markNotificationRead.mockRejectedValue(new Error('Notification 7 not found'));
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Mark as read/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Notification 7 not found');
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('adds a pushed notification to the top of the list', async () => {
    getNotifications.mockResolvedValue([readNotification]);
    const socket = captureNotificationHandler();
    renderPage();
    await screen.findByText(readNotification.message);

    await socket.push(commentPush);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText(commentPush.message)).toBeInTheDocument();
  });

  it('keeps every pushed notification when several arrive', async () => {
    getNotifications.mockResolvedValue([]);
    const socket = captureNotificationHandler();
    renderPage();
    await screen.findByText('You have no notifications.');

    await socket.push(unreadNotification);
    await socket.push(commentPush);

    // Newest first: the second push is at the top, and the first is kept.
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText(commentPush.message)).toBeInTheDocument();
    expect(within(items[1]).getByText(unreadNotification.message)).toBeInTheDocument();
  });

  it('ignores a push that arrives while the list is still loading', async () => {
    // A promise the test resolves itself, to keep the page loading.
    let finishLoading;
    getNotifications.mockReturnValue(
      new Promise((resolve) => {
        finishLoading = resolve;
      }),
    );
    const socket = captureNotificationHandler();
    renderPage();

    await socket.push(commentPush);
    // The API saved the notification before pushing it, so it's in the
    // list the page is waiting for.
    await act(async () => {
      finishLoading([commentPush, readNotification]);
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
