/* eslint-disable import-x/prefer-default-export */
/* eslint-disable import-x/no-extraneous-dependencies */

import '@testing-library/jest-dom/vitest';

import { beforeEach, vi } from 'vitest';

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

// Suppress "window is not defined" errors that occur during test teardown.
// These happen when React 19's scheduler or react-hook-form tries to update state
// after jsdom has been torn down. This is a known issue with async React components
// in test environments and doesn't indicate actual test failures.
process.on('unhandledRejection', (reason) => {
  if (
    reason instanceof ReferenceError &&
    reason.message === 'window is not defined'
  ) {
    // Silently ignore - this is expected during test teardown
    return;
  }
  // Re-throw other unhandled rejections
  throw reason;
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
