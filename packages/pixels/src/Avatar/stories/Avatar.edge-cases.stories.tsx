import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import Avatar from '../Avatar';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Avatar> = {
  title: 'pixels/Avatar/Edge Cases',
  component: Avatar,
};

export default meta;

type Story = StoryObj<typeof Avatar>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const FailedImage: Story = {
  args: {
    fallback: 'JD',
    src: '/missing-avatar.png',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('JD')).toBeVisible();
    await expect(canvas.getAllByRole('img', { name: 'avatar' })).toHaveLength(
      2,
    );
  },
};
