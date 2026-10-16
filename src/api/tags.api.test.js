// Checks each function in tags.api.js asks for the right URL, with
// apiRequest() faked as in tickets.api.test.js.
import { describe, expect, it, vi } from 'vitest';
import { createTag, deleteTag, getTags, updateTag } from './tags.api.js';
import { apiRequest } from './client.js';

vi.mock('./client.js');

describe('tags.api', () => {
  it('getTags() calls GET /tags and returns the tags', async () => {
    const tags = [{ id: 1, name: 'bug' }];
    apiRequest.mockResolvedValue({ data: tags });

    const result = await getTags();

    expect(apiRequest).toHaveBeenCalledWith('/tags');
    expect(result).toEqual(tags);
  });

  it('createTag() sends POST /tags with the name', async () => {
    apiRequest.mockResolvedValue({ data: { id: 3, name: 'urgent' } });

    await createTag('urgent');

    expect(apiRequest).toHaveBeenCalledWith('/tags', { method: 'POST', body: { name: 'urgent' } });
  });

  it('updateTag() sends PATCH /tags/:id with the new name', async () => {
    apiRequest.mockResolvedValue({ data: { id: 3, name: 'critical' } });

    await updateTag(3, 'critical');

    expect(apiRequest).toHaveBeenCalledWith('/tags/3', {
      method: 'PATCH',
      body: { name: 'critical' },
    });
  });

  it('deleteTag() sends DELETE /tags/:id', async () => {
    apiRequest.mockResolvedValue(null);

    await deleteTag(3);

    expect(apiRequest).toHaveBeenCalledWith('/tags/3', { method: 'DELETE' });
  });
});
