// Requests about users. The front-end only needs one: the list of agents,
// to fill the "Assigned to" dropdown when editing a ticket. Without
// GET /users (added to the back-end in Lesson 07 for this), there would be
// no way to know which agents a ticket can be assigned to.
import { apiRequest } from './client.js';

// GET /users?role=agent: returns the agents ({ id, name, email, role }),
// sorted by name.
export async function getAgents() {
  const responseBody = await apiRequest('/users?role=agent');
  return responseBody.data;
}
