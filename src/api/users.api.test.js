// Checks getAgents() asks only for agents, with apiRequest() faked as in
// tickets.api.test.js.
import { describe, expect, it, vi } from 'vitest';
import { getAgents } from './users.api.js';
import { apiRequest } from './client.js';

vi.mock('./client.js');

describe('users.api', () => {
  it('getAgents() calls GET /users?role=agent and returns the agents', async () => {
    const agents = [{ id: 3, name: 'Alex Agent', email: 'alex@example.com', role: 'agent' }];
    apiRequest.mockResolvedValue({ data: agents });

    const result = await getAgents();

    expect(apiRequest).toHaveBeenCalledWith('/users?role=agent');
    expect(result).toEqual(agents);
  });
});
