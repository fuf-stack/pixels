import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as stories from './Slider.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});
