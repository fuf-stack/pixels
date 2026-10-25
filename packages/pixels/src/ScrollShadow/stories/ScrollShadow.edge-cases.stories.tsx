import type { Story } from './ScrollShadow.storySetup';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import { meta as sharedMeta } from './ScrollShadow.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/ScrollShadow/Edge Cases',
  decorators: [...[sharedMeta.decorators ?? []].flat(), edgeCaseDecorator],
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const NoOverflow: Story = {
  parameters: {
    edgeCaseDescription:
      'Content that fits the viewport does not need overflow shadows.',
  },
  args: { className: 'h-32 w-64', children: 'All content is visible' },
};
