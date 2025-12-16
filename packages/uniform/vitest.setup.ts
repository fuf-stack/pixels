/* eslint-disable import-x/prefer-default-export */
/* eslint-disable import-x/no-extraneous-dependencies */

import '@testing-library/jest-dom/vitest';

import { afterEach, beforeEach, vi } from 'vitest';

import { act } from 'react';

import { cleanup } from '@testing-library/react';

/**
 * Test log suppression patterns.
 *
 * Add substrings or regular expressions to this list to silence noisy,
 * expected warnings during test runs (e.g., accessibility notices, motion
 * preferences, third‑party deprecation warnings).
 *
 * Rationale: Keeps CI output readable without affecting runtime behavior.
 */
export const SUPPRESSED_LOG_PATTERNS: (RegExp | string)[] = [
  // SUPPRESSED: You have Reduced Motion enabled on your device. Animations may not appear as expected.. For more information and steps for solving, visit https://motion.dev/troubleshooting/reduced-motion-disabled
  /Reduced Motion enabled on your device/i,
  /motion\.dev\/troubleshooting\/reduced-motion-disabled/i,
];

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
    // Wait for multiple event loop ticks to catch all pending setImmediate callbacks
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  });
  cleanup();
});

// mock react-icons
vi.mock('react-icons/fa');
vi.mock('react-icons/fa6');

// Suppress certain console logs in tests (see SUPPRESSED_LOG_PATTERNS)
const originalWarn = console.warn;
const originalError = console.error;
const shouldSuppress = (msg: unknown): boolean => {
  if (typeof msg !== 'string') {
    return false;
  }
  return SUPPRESSED_LOG_PATTERNS.some((p) => {
    return p instanceof RegExp ? p.test(msg) : msg.includes(p);
  });
};
console.warn = (...args: unknown[]) => {
  if (shouldSuppress(args[0])) {
    return;
  }

  originalWarn(...args);
};
console.error = (...args: unknown[]) => {
  if (shouldSuppress(args[0])) {
    return;
  }
  originalError(...args);
};
