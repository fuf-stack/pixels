import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as edgeCases from './stories/SensitiveFields.edge-cases.stories';
import * as stories from './stories/SensitiveFields.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(edgeCases);
});
