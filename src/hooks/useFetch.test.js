// Tests useFetch on its own, with no page around it. renderHook() runs a
// hook inside a tiny test component, and result.current is whatever the
// hook returned on its latest render. The fetch function is a vi.fn(), so
// each test decides what "the API" answers.
import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch.js';

// A promise the test finishes by hand, by calling finish(value). It lets a
// test decide which of two requests answers first.
function createSlowAnswer() {
  let finish;
  const promise = new Promise((resolvePromise) => {
    finish = resolvePromise;
  });
  return { promise, finish };
}

describe('useFetch', () => {
  it('is loading at first, then gives the data', async () => {
    const fetchTickets = vi.fn().mockResolvedValue(['first ticket']);

    const { result } = renderHook(() => useFetch(fetchTickets, 'status=open'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(['first ticket']);
    expect(result.current.error).toBeNull();
    expect(fetchTickets).toHaveBeenCalledWith('status=open');
  });

  it('gives the error when the request fails', async () => {
    const apiError = new Error('Not found');
    apiError.status = 404;
    const fetchTickets = vi.fn().mockRejectedValue(apiError);

    const { result } = renderHook(() => useFetch(fetchTickets, '999'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // The whole Error, so a page can check its status.
    expect(result.current.error).toBe(apiError);
    expect(result.current.data).toBeNull();
  });

  it('asks again when reload() is called', async () => {
    const fetchTickets = vi.fn().mockResolvedValueOnce(['old']).mockResolvedValueOnce(['new']);
    const { result } = renderHook(() => useFetch(fetchTickets));
    await waitFor(() => expect(result.current.data).toEqual(['old']));

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.data).toEqual(['new']));
    expect(fetchTickets).toHaveBeenCalledTimes(2);
  });

  it('asks again, with the new value, when the argument changes', async () => {
    const fetchTicket = vi.fn().mockResolvedValue({ id: 1 });
    // initialProps and rerender() pretend the page re-rendered with a
    // different ticket ID, as if the URL had changed.
    const { result, rerender } = renderHook(
      ({ ticketId }) => useFetch(fetchTicket, ticketId),
      { initialProps: { ticketId: '1' } },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    fetchTicket.mockResolvedValue({ id: 2 });
    rerender({ ticketId: '2' });

    await waitFor(() => expect(result.current.data).toEqual({ id: 2 }));
    expect(fetchTicket).toHaveBeenLastCalledWith('2');
  });

  it('ignores a slow answer that arrives after a newer one', async () => {
    const slowAnswer = createSlowAnswer();
    const fetchTicket = vi.fn()
      .mockReturnValueOnce(slowAnswer.promise)
      .mockResolvedValueOnce({ id: 2 });
    const { result, rerender } = renderHook(
      ({ ticketId }) => useFetch(fetchTicket, ticketId),
      { initialProps: { ticketId: '1' } },
    );

    // Ticket 2 is asked for, and answers, before ticket 1 has answered.
    rerender({ ticketId: '2' });
    await waitFor(() => expect(result.current.data).toEqual({ id: 2 }));
    await act(async () => {
      slowAnswer.finish({ id: 1 });
    });

    // This is the `ignore` flag's job: ticket 1's late answer is dropped.
    expect(result.current.data).toEqual({ id: 2 });
  });

  it('lets the page change the data with setData', async () => {
    const fetchComments = vi.fn().mockResolvedValue(['first comment']);
    const { result } = renderHook(() => useFetch(fetchComments, '1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setData((currentComments) => [...currentComments, 'second comment']);
    });

    expect(result.current.data).toEqual(['first comment', 'second comment']);
  });
});
