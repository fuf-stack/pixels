import { afterAll, beforeAll, describe } from 'vitest';

import { resetLocalTimeZone, setLocalTimeZone } from '@internationalized/date';
import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as stories from './Examples.stories';

describe('Story Snapshots', () => {
  // Force a deterministic local timezone so snapshot output is stable
  // across machines/CI runners.
  beforeAll(() => {
    setLocalTimeZone('UTC');
  });

  // Reset global timezone override to avoid leaking test state.
  afterAll(() => {
    resetLocalTimeZone();
  });

  storySnapshots(stories);
});
