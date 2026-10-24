import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as stories from './SensitiveFields.stories';
import * as edgeCases from './SensitiveFieldsEdgeCases.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(edgeCases);
});
