// getFieldError() is a plain function, so these tests just call it and
// check what it returns, like formatDate.test.js.
import { describe, expect, it } from 'vitest';
import { getFieldError } from './getFieldError.js';

// The same kind of error apiRequest() throws for a 400.
const validationError = new Error('Validation failed');
validationError.status = 400;
validationError.details = [
  { field: 'subject', message: 'subject is required' },
  { field: 'description', message: 'description is required' },
];

describe('getFieldError', () => {
  it("returns the message for the field it's asked about", () => {
    expect(getFieldError(validationError, 'description')).toBe('description is required');
  });

  it('returns an empty string when that field has no problem', () => {
    expect(getFieldError(validationError, 'status')).toBe('');
  });

  it('returns an empty string when there is no error', () => {
    expect(getFieldError(null, 'subject')).toBe('');
  });

  it('returns an empty string for an error without details (e.g. a 403)', () => {
    expect(getFieldError(new Error('You do not have permission'), 'subject')).toBe('');
  });
});
