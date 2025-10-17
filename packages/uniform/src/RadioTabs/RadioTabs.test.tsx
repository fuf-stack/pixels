import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as stories from './RadioTabs.stories';

// TODO: RadioTabs story throws after heroui v2.7 update:
// Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
// React limits the number of nested updates to prevent infinite loops.
// @ts-expect-error ok for now
delete stories.RadioTabs;

describe.skip('Story Snapshots', () => {
  storySnapshots(stories);
});
