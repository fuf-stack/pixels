import type { Story } from './ScrollShadow.storySetup';

import { meta as sharedMeta } from './ScrollShadow.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/ScrollShadow/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const NoOverflow: Story = {
  args: { className: 'h-32 w-64', children: 'All content is visible' },
};
