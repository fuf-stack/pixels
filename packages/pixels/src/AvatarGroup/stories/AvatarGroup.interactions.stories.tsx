import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, userEvent, within } from 'storybook/test';

import AvatarGroup from '../AvatarGroup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const handleOpen = fn();

const meta: Meta<typeof AvatarGroup> = {
  title: 'pixels/AvatarGroup/Interactions',
  component: AvatarGroup,
};

export default meta;

type Story = StoryObj<typeof AvatarGroup>;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardNavigation: Story = {
  args: {
    avatarWrapper: 'button',
    avatars: ['Jane', 'Alex'].map((name) => {
      return {
        fallback: name[0],
        src: '',
        wrapperProps: {
          'aria-label': `Open ${name}`,
          onClick: handleOpen,
          type: 'button',
        },
      };
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const jane = canvas.getByRole('button', { name: 'Open Jane' });
    const alex = canvas.getByRole('button', { name: 'Open Alex' });

    jane.focus();
    await expect(jane).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(handleOpen).toHaveBeenCalledOnce();

    await userEvent.tab();
    await expect(alex).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(handleOpen).toHaveBeenCalledTimes(2);
  },
};
