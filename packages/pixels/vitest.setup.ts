/* eslint-disable import-x/no-extraneous-dependencies */
import '@testing-library/jest-dom/vitest';

import { beforeEach, vi } from 'vitest';

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

// mock react-icons
vi.mock('react-icons/fa');
vi.mock('react-icons/fa6');
vi.mock('react-icons/hi');
