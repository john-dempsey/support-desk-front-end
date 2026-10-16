// Tests the tags page's full CRUD: the list, adding, renaming and
// deleting. tags.api.js is faked, and window.confirm() is faked whenever
// a test deletes something.
import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagsPage from './TagsPage.jsx';
import { createTag, deleteTag, getTags, updateTag } from '../api/tags.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

vi.mock('../api/tags.api.js');

const testTags = [
  { id: 2, name: 'billing' },
  { id: 1, name: 'bug' },
];

// Shows the page with testTags, and waits for them to appear.
async function renderTagsPage() {
  renderWithProviders(<TagsPage />);
  await screen.findByText('billing');
}

describe('TagsPage', () => {
  it('shows the tags from the API', async () => {
    getTags.mockResolvedValue(testTags);

    await renderTagsPage();

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('bug')).toBeInTheDocument();
  });

  it('shows a message when there are no tags', async () => {
    getTags.mockResolvedValue([]);

    renderWithProviders(<TagsPage />);

    expect(await screen.findByText('There are no tags yet.')).toBeInTheDocument();
  });

  it('adds a tag, then loads the list again', async () => {
    // The first call is the page loading; the second is after adding.
    getTags.mockResolvedValueOnce(testTags);
    getTags.mockResolvedValueOnce([...testTags, { id: 3, name: 'urgent' }]);
    createTag.mockResolvedValue({ id: 3, name: 'urgent' });
    await renderTagsPage();

    await userEvent.type(screen.getByLabelText('New tag name'), 'urgent');
    await userEvent.click(screen.getByRole('button', { name: 'Add tag' }));

    expect(createTag).toHaveBeenCalledWith('urgent');
    expect(await screen.findByText('urgent')).toBeInTheDocument();
    expect(screen.getByLabelText('New tag name')).toHaveValue('');
  });

  it('says the name is taken when the API answers 409', async () => {
    getTags.mockResolvedValue(testTags);
    // The real API's message for a duplicate tag name.
    const conflictError = new Error('A record with that Tag_name_key already exists');
    conflictError.status = 409;
    createTag.mockRejectedValue(conflictError);
    await renderTagsPage();

    await userEvent.type(screen.getByLabelText('New tag name'), 'bug');
    await userEvent.click(screen.getByRole('button', { name: 'Add tag' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A tag with that name already exists.',
    );
  });

  it('renames a tag', async () => {
    getTags.mockResolvedValueOnce(testTags);
    getTags.mockResolvedValueOnce([{ id: 2, name: 'invoices' }, { id: 1, name: 'bug' }]);
    updateTag.mockResolvedValue({ id: 2, name: 'invoices' });
    await renderTagsPage();

    await userEvent.click(screen.getByRole('button', { name: 'Rename billing' }));
    const nameInput = screen.getByLabelText('New name for "billing"');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'invoices');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateTag).toHaveBeenCalledWith(2, 'invoices');
    expect(await screen.findByText('invoices')).toBeInTheDocument();
    expect(screen.queryByLabelText('New name for "billing"')).not.toBeInTheDocument();
  });

  it('puts the tag back as it was when renaming is cancelled', async () => {
    getTags.mockResolvedValue(testTags);
    await renderTagsPage();

    await userEvent.click(screen.getByRole('button', { name: 'Rename billing' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(updateTag).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Rename billing' })).toBeInTheDocument();
  });

  it('deletes a tag when confirmed', async () => {
    getTags.mockResolvedValue(testTags);
    deleteTag.mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await renderTagsPage();

    await userEvent.click(screen.getByRole('button', { name: 'Delete bug' }));

    expect(deleteTag).toHaveBeenCalledWith(1);
    const remainingItems = screen.getAllByRole('listitem');
    expect(remainingItems).toHaveLength(1);
    expect(within(remainingItems[0]).getByText('billing')).toBeInTheDocument();
  });
});
