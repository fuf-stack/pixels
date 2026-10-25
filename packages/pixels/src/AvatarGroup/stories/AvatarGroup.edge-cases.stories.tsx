import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import AvatarGroup from '../AvatarGroup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof AvatarGroup> = {
  title: 'pixels/AvatarGroup/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: AvatarGroup,
};

export default meta;

type Story = StoryObj<typeof AvatarGroup>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const Empty: Story = {
  parameters: {
    edgeCaseDescription:
      'An empty avatar list renders without a count indicator.',
  },
};

export const Unlimited: Story = {
  parameters: {
    edgeCaseDescription:
      'A zero maximum displays all avatars without an overflow count.',
  },
  args: {
    avatars: ['A', 'B', 'C', 'D', 'E'].map((fallback) => {
      return { fallback, src: '' };
    }),
    max: 0,
  },
};
