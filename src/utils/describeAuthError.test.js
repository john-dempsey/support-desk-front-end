// describeAuthError() is a plain function, like getFieldError(), so these
// tests just call it and check what it returns.
import { describe, expect, it } from 'vitest';
import { describeAuthError } from './describeAuthError.js';

function createApiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

describe('describeAuthError', () => {
  it('asks the user to wait after too many attempts (429)', () => {
    const result = describeAuthError(createApiError(429, 'Too many requests'));

    expect(result.message).toContain('Wait a few minutes');
  });

  it('rewords a duplicate email (409)', () => {
    const result = describeAuthError(
      createApiError(409, 'A record with that User_email_key already exists'),
    );

    expect(result.message).toBe('An account with that email already exists. Try logging in.');
  });

  it('returns any other error unchanged', () => {
    const error = createApiError(401, 'Invalid email or password');

    expect(describeAuthError(error)).toBe(error);
  });
});
