import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

// eslint-disable-next-line import-x/no-namespace
import * as stories from './createWithSuspense.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});
