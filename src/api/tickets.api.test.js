// Tests that each function in tickets.api.js asks for the right URL and
// returns the right part of the response. apiRequest() is replaced with a
// fake, because client.test.js already tests it on its own.
import { describe, expect, it, vi } from 'vitest';
import { createTicket, deleteTicket, getTicket, getTickets, updateTicket } from './tickets.api.js';
import { apiRequest } from './client.js';

vi.mock('./client.js');

describe('tickets.api', () => {
  it('getTickets() calls GET /tickets and returns the tickets and meta', async () => {
    const tickets = [{ id: 1, subject: 'Cannot log in' }];
    const meta = { page: 1, pageSize: 10, total: 1, totalPages: 1 };
    apiRequest.mockResolvedValue({ data: tickets, meta });

    const result = await getTickets();

    expect(apiRequest).toHaveBeenCalledWith('/tickets');
    expect(result).toEqual({ tickets, meta });
  });

  it('getTickets(queryString) adds the query string to the URL', async () => {
    apiRequest.mockResolvedValue({ data: [], meta: {} });

    await getTickets('status=open&page=2');

    expect(apiRequest).toHaveBeenCalledWith('/tickets?status=open&page=2');
  });

  it('getTicket(id) calls GET /tickets/:id and returns the ticket', async () => {
    const ticket = { id: 2, subject: 'Invoice discrepancy' };
    apiRequest.mockResolvedValue({ data: ticket });

    const result = await getTicket('2');

    expect(apiRequest).toHaveBeenCalledWith('/tickets/2');
    expect(result).toEqual(ticket);
  });

  it('createTicket() sends POST /tickets and returns the saved ticket', async () => {
    const newTicket = { subject: 'Printer jammed', description: 'Paper stuck' };
    apiRequest.mockResolvedValue({ data: { id: 5, ...newTicket } });

    const result = await createTicket(newTicket);

    expect(apiRequest).toHaveBeenCalledWith('/tickets', { method: 'POST', body: newTicket });
    expect(result.id).toBe(5);
  });

  it('updateTicket() sends PATCH /tickets/:id with the changes', async () => {
    apiRequest.mockResolvedValue({ data: { id: 2, status: 'resolved' } });

    await updateTicket('2', { status: 'resolved' });

    expect(apiRequest).toHaveBeenCalledWith('/tickets/2', {
      method: 'PATCH',
      body: { status: 'resolved' },
    });
  });

  it('deleteTicket() sends DELETE /tickets/:id', async () => {
    apiRequest.mockResolvedValue(null);

    await deleteTicket(2);

    expect(apiRequest).toHaveBeenCalledWith('/tickets/2', { method: 'DELETE' });
  });
});
