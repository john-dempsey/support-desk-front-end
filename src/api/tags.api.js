// Requests about tags: labels such as "billing" or "bug". A tag has only a
// name, so this is the simplest full set of CRUD calls in the app, and a
// good one to copy for a simple resource in your own API.
import { apiRequest } from './client.js';

// GET /tags: returns every tag, sorted by name.
export async function getTags() {
  const responseBody = await apiRequest('/tags');
  return responseBody.data;
}

// POST /tags: returns the saved tag. A 409 means a tag with that name
// already exists.
export async function createTag(name) {
  const responseBody = await apiRequest('/tags', { method: 'POST', body: { name } });
  return responseBody.data;
}

// PATCH /tags/:id: renames a tag, and returns it.
export async function updateTag(tagId, name) {
  const responseBody = await apiRequest(`/tags/${tagId}`, { method: 'PATCH', body: { name } });
  return responseBody.data;
}

// DELETE /tags/:id: 204 No Content, so nothing to return.
export async function deleteTag(tagId) {
  await apiRequest(`/tags/${tagId}`, { method: 'DELETE' });
}
