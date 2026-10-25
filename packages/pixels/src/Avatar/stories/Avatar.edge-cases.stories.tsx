import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { expect, within } from 'storybook/test';

import Avatar from '../Avatar';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Avatar> = {
  title: 'pixels/Avatar/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: Avatar,
};

export default meta;

type Story = StoryObj<typeof Avatar>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const FailedImage: Story = {
  parameters: {
    edgeCaseDescription:
      'A failed image request displays fallback content instead of a broken image.',
  },
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
