/* eslint-disable import-x/no-extraneous-dependencies */
import '@testing-library/jest-dom/vitest';

import { afterEach, beforeEach, vi } from 'vitest';

import { act } from 'react';

import { cleanup } from '@testing-library/react';

// Force cleanup and reset DOM state between each test to prevent cross-test contamination
beforeEach(() => {
  // cleanup() from React Testing Library unmounts any React components and removes
  // their event listeners, but may not catch everything in the Storybook context
  cleanup();

  // Manually clear any remaining DOM elements that might persist from Storybook
  // or previous tests by resetting the entire body content.
  // This is especially important when:
  // 1. Running snapshot tests across multiple stories
  // 2. Using portal-based components that render outside React's tree
  // 3. Testing components that manipulate DOM elements directly
  document.body.innerHTML = '';
});

// React 19's scheduler uses setImmediate/MessageChannel for async work.
// After cleanup(), pending scheduler callbacks can fire after jsdom is torn down,
// causing "window is not defined" errors. This afterEach flushes all pending React work.
afterEach(async () => {
  // Use act() to flush any pending React scheduler work
  await act(async () => {
    // Wait for pending setImmediate callbacks
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  });
  cleanup();
});

// mock react-icons
vi.mock('react-icons/fa');
vi.mock('react-icons/fa6');
vi.mock('react-icons/hi');
