// Checks each function in notifications.api.js asks for the right URL and
// returns the response's data, with apiRequest() faked as in
// tickets.api.test.js.
import { describe, expect, it, vi } from 'vitest';
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationRead,
} from './notifications.api.js';
import { apiRequest } from './client.js';
import { readNotification, unreadNotification } from '../test/testNotifications.js';

vi.mock('./client.js');

describe('notifications.api', () => {
  it('getNotifications() calls GET /notifications and returns the list', async () => {
    apiRequest.mockResolvedValue({ data: [unreadNotification, readNotification] });

    const result = await getNotifications();

    expect(apiRequest).toHaveBeenCalledWith('/notifications');
    expect(result).toEqual([unreadNotification, readNotification]);
  });

  it('getUnreadNotifications() asks for unread ones only', async () => {
    apiRequest.mockResolvedValue({ data: [unreadNotification] });

    const result = await getUnreadNotifications();

    expect(apiRequest).toHaveBeenCalledWith('/notifications?unread=true');
    expect(result).toEqual([unreadNotification]);
  });

  it('markNotificationRead() sends a PATCH and returns the updated notification', async () => {
    const markedNotification = { ...unreadNotification, readAt: '2026-10-08T12:00:00.000Z' };
    apiRequest.mockResolvedValue({ data: markedNotification });

    const result = await markNotificationRead(7);

    expect(apiRequest).toHaveBeenCalledWith('/notifications/7/read', { method: 'PATCH' });
    expect(result).toEqual(markedNotification);
  });
});
