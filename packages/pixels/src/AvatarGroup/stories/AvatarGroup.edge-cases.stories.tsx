import type { Meta, StoryObj } from '@storybook/react-vite';

import AvatarGroup from '../AvatarGroup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof AvatarGroup> = {
  title: 'pixels/AvatarGroup/Edge Cases',
  component: AvatarGroup,
};

export default meta;

type Story = StoryObj<typeof AvatarGroup>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const Empty: Story = {};

export const Unlimited: Story = {
  args: {
    avatars: ['A', 'B', 'C', 'D', 'E'].map((fallback) => {
      return { fallback, src: '' };
    }),
    max: 0,
  },
};
