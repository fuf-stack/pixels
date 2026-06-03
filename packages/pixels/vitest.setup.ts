/* eslint-disable import-x/no-extraneous-dependencies */
import '@testing-library/jest-dom/vitest';

import { beforeEach, vi } from 'vitest';

import { cleanup } from '@testing-library/react';

// HeroUI Tabs (and other UI primitives) rely on ResizeObserver in passive effects.
// In Vitest's jsdom environment, ResizeObserver may be missing depending on jsdom
// version/runtime, which causes story snapshot tests to fail with:
//   "ReferenceError: ResizeObserver is not defined"
//
// This test-only polyfill provides the minimum observer surface used by components
// under test. It intentionally performs no real resize tracking because snapshots
// only need components to mount without throwing.
//
// Remove this once our test environment guarantees a native ResizeObserver.
if (globalThis.ResizeObserver === undefined) {
  class ResizeObserverMock implements ResizeObserver {
    // no-op: tests do not assert resize callbacks today
    // eslint-disable-next-line class-methods-use-this
    observe() {}

    // no-op: included for interface completeness
    // eslint-disable-next-line class-methods-use-this
    unobserve() {}

    // no-op: included for interface completeness
    // eslint-disable-next-line class-methods-use-this
    disconnect() {}
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: ResizeObserverMock,
  });
}

// sonner's swipe-to-dismiss handler expects pointer capture APIs to exist.
// jsdom does not currently implement them, so provide a minimal test shim.
if (
  globalThis.HTMLElement !== undefined &&
  globalThis.HTMLElement.prototype.setPointerCapture === undefined
) {
  Object.defineProperties(globalThis.HTMLElement.prototype, {
    setPointerCapture: {
      configurable: true,
      writable: true,
      value() {},
    },
    releasePointerCapture: {
      configurable: true,
      writable: true,
      value() {},
    },
    hasPointerCapture: {
      configurable: true,
      writable: true,
      value() {
        return false;
      },
    },
  });
}

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
// These happen when React 19's scheduler tries to update state after jsdom
// has been torn down. This is a known issue with async React components
// in test environments and doesn't indicate actual test failures.
//
// We need to handle BOTH:
// - unhandledRejection: for promise-based async errors
// - uncaughtException: for setImmediate-based scheduler errors (React 19's scheduler)
process.on('unhandledRejection', (reason) => {
  if (
    reason instanceof ReferenceError &&
    reason.message === 'window is not defined'
  ) {
    return;
  }
  throw reason;
});

process.on('uncaughtException', (error) => {
  if (
    error instanceof ReferenceError &&
    error.message === 'window is not defined'
  ) {
    return;
  }
  throw error;
});

// mock react-icons
vi.mock('react-icons/fa');
vi.mock('react-icons/fa6');
vi.mock('react-icons/hi');
