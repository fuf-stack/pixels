import { afterEach, describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import createExpectedErrorHandler from './stories/createExpectedErrorHandler';
import * as stories from './stories/createWithSuspense.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Expected story errors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles the deliberate error without logging it', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Failed to fetch user error-user');
    const handleCaughtError = createExpectedErrorHandler(error);

    handleCaughtError(error, { componentStack: 'UserProfileWithError' });

    expect(report).not.toHaveBeenCalled();
  });

  it.each([
    new Error('Failed to fetch user error-user'),
    new Error('Unexpected render failure'),
    'Unexpected rejection',
  ])(
    'reports another caught value even if its message matches: %s',
    (error) => {
      const report = vi.spyOn(console, 'error').mockImplementation(() => {});
      const expectedError = new Error('Failed to fetch user error-user');
      const handleCaughtError = createExpectedErrorHandler(expectedError);
      const errorInfo = { componentStack: 'UnexpectedComponent' };

      handleCaughtError(error, errorInfo);

      expect(report).toHaveBeenCalledExactlyOnceWith(error, errorInfo);
    },
  );
});
