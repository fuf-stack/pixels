import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as stories from './RadioTabs.stories';

// TODO(#1873): Re-enable with the browser stories when the runner isolation issue is fixed.
// Both runners can deadlock while advancing through this story module. See the
// matching `test-exclude` tag in RadioTabs.stories.tsx.
describe.skip('Story Snapshots', () => {
  storySnapshots(stories);
});
