// formatDate is a plain function with no React in it, so it's tested by
// calling it and checking what it returns. No rendering is needed.
import { describe, expect, it } from 'vitest';
import { formatDate } from './formatDate.js';

describe('formatDate', () => {
  it('turns an ISO date string into a readable date', () => {
    // Midday UTC, so the day is the same in any time zone the tests run in.
    const readableDate = formatDate('2026-10-08T12:00:00.000Z');

    expect(readableDate).toContain('8 Oct 2026');
  });

  it('returns "Unknown date" instead of crashing for a bad value', () => {
    expect(formatDate('not a date')).toBe('Unknown date');
    expect(formatDate(undefined)).toBe('Unknown date');
  });
});
