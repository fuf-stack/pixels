import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as stories from './stories/Tabs.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});
