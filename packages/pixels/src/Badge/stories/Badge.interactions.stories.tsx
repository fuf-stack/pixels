import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, userEvent, within } from 'storybook/test';

import Badge from '../Badge';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const handleOpen = fn();

const meta: Meta<typeof Badge> = {
  title: 'pixels/Badge/Interactions',
  component: Badge,
};

export default meta;

type Story = StoryObj<typeof Badge>;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardActivation: Story = {
  args: {
    children: (
      <button onClick={handleOpen} type="button">
        Messages
      </button>
    ),
    content: 3,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Messages',
    });

    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(handleOpen).toHaveBeenCalledOnce();
  },
};
