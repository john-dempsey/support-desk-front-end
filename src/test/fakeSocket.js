// A test helper for anything that listens with onNotification(). The test
// file fakes the socket module first:
//   vi.mock('../realtime/socket.js');
// Then this keeps the handler the component passes to onNotification(),
// so the test can "push" a notification as if it came from the server:
//   const socket = captureNotificationHandler();
//   ... render the page ...
//   await socket.push(commentPush);
import { vi } from 'vitest';
import { act } from '@testing-library/react';
import { onNotification } from '../realtime/socket.js';

export function captureNotificationHandler() {
  let savedHandler = null;

  onNotification.mockImplementation((handler) => {
    savedHandler = handler;
    // The real onNotification() returns a "stop listening" function.
    return vi.fn();
  });

  return {
    // act() tells React a change is coming from outside (here, the
    // "socket"), and waits for the screen to update before the test goes
    // on to check it.
    async push(notification) {
      if (savedHandler === null) {
        throw new Error('Nothing is listening: render the component first.');
      }
      await act(async () => {
        savedHandler(notification);
      });
    },
  };
}
