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

// fix react useId not consistent in snapshots (used directly by heroui)
// e.g.: https://github.com/heroui-inc/heroui/blob/canary/packages/components/checkbox/src/use-checkbox.ts#L6
vi.mock('react', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const reactOrig = await importOriginal<typeof import('react')>();

  const useId = () => {
    return 'react-useId-mock';
  };

  // @ts-expect-error we also have to mock useId in default (React.useId)
  reactOrig.default.useId = useId;

  return { ...reactOrig, useId };
});

// mock react-icons
vi.mock('react-icons/fa');
vi.mock('react-icons/fa6');
vi.mock('react-icons/hi');
