import { afterAll, beforeAll, describe, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

// eslint-disable-next-line import-x/no-namespace
import * as stories from './createWithSuspense.stories';

describe('Story Snapshots', () => {
  // Suppress expected error logs from error boundary stories
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = vi.fn((...args) => {
      const message = args[0];
      const fullMessage = args.join(' ');

      // Suppress React error boundary logs and expected test errors
      if (
        (typeof message === 'string' &&
          (message.includes('Error:') ||
            message.includes('Failed to fetch user') ||
            message.includes('The above error occurred') ||
            message.includes('React will try to recreate') ||
            message.includes('Error caught by boundary'))) ||
        (message instanceof Error &&
          message.message.includes('Failed to fetch user')) ||
        fullMessage.includes('The above error occurred') ||
        fullMessage.includes('React will try to recreate')
      ) {
        return;
      }

      // Log other errors normally
      originalConsoleError(...args);
    });
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  storySnapshots(stories);
});
