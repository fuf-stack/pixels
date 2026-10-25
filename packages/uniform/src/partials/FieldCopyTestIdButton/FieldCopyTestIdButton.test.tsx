import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as stories from './stories/FieldCopyTestIdButton.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});
