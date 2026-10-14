// Tests that each function in tickets.api.js asks for the right URL and
// returns the right part of the response. apiRequest() is replaced with a
// fake, because client.test.js already tests it on its own.
import { describe, expect, it, vi } from 'vitest';
import { getTicket, getTickets } from './tickets.api.js';
import { apiRequest } from './client.js';

vi.mock('./client.js');

describe('tickets.api', () => {
  it('getTickets() calls GET /tickets and returns the tickets', async () => {
    const tickets = [{ id: 1, subject: 'Cannot log in' }];
    apiRequest.mockResolvedValue({ data: tickets, meta: { total: 1 } });

    const result = await getTickets();

    expect(apiRequest).toHaveBeenCalledWith('/tickets');
    expect(result).toEqual(tickets);
  });

  it('getTicket(id) calls GET /tickets/:id and returns the ticket', async () => {
    const ticket = { id: 2, subject: 'Invoice discrepancy' };
    apiRequest.mockResolvedValue({ data: ticket });

    const result = await getTicket('2');

    expect(apiRequest).toHaveBeenCalledWith('/tickets/2');
    expect(result).toEqual(ticket);
  });
});
