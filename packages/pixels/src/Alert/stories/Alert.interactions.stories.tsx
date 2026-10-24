import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, userEvent, within } from 'storybook/test';

import Alert from '../Alert';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Alert> = {
  title: 'pixels/Alert/Interactions',
  component: Alert,
};

export default meta;

type Story = StoryObj<typeof Alert>;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardDismissal: Story = {
  args: {
    children: 'Dismiss this message',
    closable: true,
    onClose: fn(),
    title: 'Notice',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Close' });

    close.focus();
    await expect(close).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
