/* eslint-disable max-classes-per-file */
/* eslint-disable import-x/prefer-default-export */
/* eslint-disable import-x/no-extraneous-dependencies */

import '@testing-library/jest-dom/vitest';

import { beforeEach, vi } from 'vitest';

import { cleanup } from '@testing-library/react';

// Workaround: Storybook >=10.2.10 + jsdom 27 PointerEvent/MouseEvent crash
//
// Storybook's bundled @testing-library/user-event clones events by passing the
// original event object as the init dict: `new event.constructor(type, event)`.
// jsdom 27 rejects this because `event.view` is a Window reference from a
// different internal realm, failing its strict type check with:
//   "Failed to construct 'PointerEvent': member view is not of type Window."
//
// We patch both constructors to extract only the plain init properties and drop
// `view`. This can be removed once Storybook or jsdom fixes the incompatibility.
//
// TODO: LATER remove the block below and run the tests. If they pass, delete it.
// Or keep the block — it will log a notice when the fix lands upstream.
if (globalThis.window !== undefined) {
  try {
    const probe = new MouseEvent('click', { view: globalThis.window });
    new PointerEvent('click', probe as unknown as PointerEventInit);
    console.info(
      '[FUF][vitest.setup] jsdom event cloning works natively now — ' +
        'the MouseEvent/PointerEvent workaround below can be removed.',
    );
  } catch {
    // still broken — keep the workaround
  }
  const eventLikeToMouseInit = (
    init: MouseEventInit | Event | undefined,
  ): MouseEventInit => {
    if (!(init instanceof Event)) {
      return init ?? {};
    }
    const event = init as MouseEvent;
    return {
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      composed: event.composed,
      detail: (event as UIEvent).detail,
      screenX: event.screenX,
      screenY: event.screenY,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      button: event.button,
      buttons: event.buttons,
      relatedTarget: event.relatedTarget,
      view: undefined,
    };
  };

  const NativeMouseEvent = globalThis.window.MouseEvent;
  class PatchedMouseEvent extends NativeMouseEvent {
    constructor(type: string, init: MouseEventInit | Event = {}) {
      super(type, eventLikeToMouseInit(init));
    }
  }
  Object.defineProperty(globalThis.window, 'MouseEvent', {
    configurable: true,
    writable: true,
    value: PatchedMouseEvent,
  });
  Object.defineProperty(globalThis, 'MouseEvent', {
    configurable: true,
    writable: true,
    value: PatchedMouseEvent,
  });

  if (globalThis.window.PointerEvent !== undefined) {
    const NativePointerEvent = globalThis.window.PointerEvent;
    class PatchedPointerEvent extends NativePointerEvent {
      constructor(type: string, init: PointerEventInit | Event = {}) {
        const mouseInit = eventLikeToMouseInit(init);
        if (!(init instanceof Event)) {
          super(type, { ...init, view: undefined });
          return;
        }
        const event = init as PointerEvent;
        super(type, {
          ...mouseInit,
          pointerId: event.pointerId,
          width: event.width,
          height: event.height,
          pressure: event.pressure,
          tangentialPressure: event.tangentialPressure,
          tiltX: event.tiltX,
          tiltY: event.tiltY,
          twist: event.twist,
          pointerType: event.pointerType,
          isPrimary: event.isPrimary,
          view: undefined,
        });
      }
    }
    Object.defineProperty(globalThis.window, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: PatchedPointerEvent,
    });
    Object.defineProperty(globalThis, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: PatchedPointerEvent,
    });
  }
}

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
//
// We need to handle BOTH:
// - unhandledRejection: for promise-based async errors
// - uncaughtException: for setImmediate-based scheduler errors (React 19's scheduler)
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

process.on('uncaughtException', (error) => {
  if (
    error instanceof ReferenceError &&
    error.message === 'window is not defined'
  ) {
    // Silently ignore - this is expected during test teardown
    // when React's scheduler (via setImmediate) runs after jsdom is torn down
    return;
  }
  // Re-throw other uncaught exceptions
  throw error;
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
