// Runs before every test file (see `setupFiles` in vite.config.js).
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// Adds browser-specific checks to expect(), e.g.
// expect(element).toBeInTheDocument() and .toHaveTextContent('...').
import '@testing-library/jest-dom/vitest';

// Removes whatever the last test rendered, so every test starts with an
// empty page.
afterEach(() => {
  cleanup();
});
