// The page at /tags: list, add, rename and delete tags. A tag has only a
// name, so this page shows full CRUD (create, read, update, delete) with
// as little else in the way as possible.
//
// Only agents and admins can change tags, so App.jsx's ProtectedRoute
// only lets them reach this page, and only they see its link in NavBar.
import { useEffect, useState } from 'react';
import { createTag, deleteTag, getTags, updateTag } from '../api/tags.api.js';
import TagForm from '../components/TagForm.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// For a duplicate name, the API answers 409 with a message that names a
// database index ("A record with that Tag_name_key already exists"). That
// means nothing to a user, so the page says it in its own words. Any other
// error is shown as the API sent it.
function describeTagError(error) {
  if (error.status === 409) {
    return new Error('A tag with that name already exists.');
  }
  return error;
}

function TagsPage() {
  const [tags, setTags] = useState(null);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // The id of the tag being renamed, or null when none is. That tag's row
  // shows a TagForm instead of its name and buttons.
  const [editingTagId, setEditingTagId] = useState(null);
  const [addError, setAddError] = useState(null);
  const [renameError, setRenameError] = useState(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadTags() {
      try {
        const tagsData = await getTags();
        if (!ignore) {
          setTags(tagsData);
        }
      } catch (error) {
        if (!ignore) {
          setLoadErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTags();

    return () => {
      ignore = true;
    };
  }, []);

  // After adding or renaming, the list is loaded again rather than changed
  // here: the API sorts tags by name, so asking it again puts the new or
  // renamed tag in the right place without the page sorting anything.
  async function reloadTags() {
    const latestTags = await getTags();
    setTags(latestTags);
  }

  // Called by the "Add a tag" form. Returns true if the tag was saved.
  async function handleAddTag(name) {
    setAddError(null);
    try {
      await createTag(name);
      await reloadTags();
      return true;
    } catch (error) {
      setAddError(describeTagError(error));
      return false;
    }
  }

  function startRenaming(tagId) {
    setRenameError(null);
    setEditingTagId(tagId);
  }

  async function handleRenameTag(name) {
    setRenameError(null);
    try {
      await updateTag(editingTagId, name);
      await reloadTags();
      setEditingTagId(null);
      return true;
    } catch (error) {
      setRenameError(describeTagError(error));
      return false;
    }
  }

  async function handleDeleteTag(tagToDelete) {
    const isConfirmed = window.confirm(`Delete the tag "${tagToDelete.name}"?`);
    if (!isConfirmed) {
      return;
    }

    setDeleteErrorMessage('');
    try {
      await deleteTag(tagToDelete.id);
      // Deleting doesn't change the order of the others, so there's no
      // need to load the list again: just leave that tag out.
      setTags(tags.filter((tag) => tag.id !== tagToDelete.id));
    } catch (error) {
      setDeleteErrorMessage(error.message);
    }
  }

  return (
    <>
      <h1>Tags</h1>

      <h2>Add a tag</h2>
      <TagForm
        inputId="new-tag-name"
        label="New tag name"
        submitLabel="Add tag"
        onSubmit={handleAddTag}
        error={addError}
      />

      <h2>All tags</h2>
      {isLoading && <Loading message="Loading tags…" />}
      {loadErrorMessage && <ErrorMessage message={loadErrorMessage} />}
      {deleteErrorMessage && <ErrorMessage message={deleteErrorMessage} />}
      {tags && tags.length === 0 && <p>There are no tags yet.</p>}

      {tags && tags.length > 0 && (
        <ul className="tag-list">
          {tags.map((tag) => (
            <li key={tag.id}>
              {tag.id === editingTagId ? (
                <TagForm
                  inputId={`tag-name-${tag.id}`}
                  label={`New name for "${tag.name}"`}
                  initialName={tag.name}
                  submitLabel="Save"
                  onSubmit={handleRenameTag}
                  onCancel={() => setEditingTagId(null)}
                  error={renameError}
                />
              ) : (
                <>
                  <span className="tag-name">{tag.name}</span>
                  {/* aria-label tells the many "Rename" and "Delete"
                      buttons apart for screen reader users. */}
                  <button
                    type="button"
                    className="secondary-button"
                    aria-label={`Rename ${tag.name}`}
                    onClick={() => startRenaming(tag.id)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    aria-label={`Delete ${tag.name}`}
                    onClick={() => handleDeleteTag(tag)}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default TagsPage;
