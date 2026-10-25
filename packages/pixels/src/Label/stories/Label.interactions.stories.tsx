import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, userEvent, within } from 'storybook/test';

import Label from '../Label';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const handleClose = fn();

const meta: Meta<typeof Label> = {
  title: 'pixels/Label/Interactions',
  component: Label,
};

export default meta;

type Story = StoryObj<typeof Label>;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardDismissal: Story = {
  args: {
    children: 'Removable label',
    onClose: handleClose,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'close chip' });

    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(handleClose).toHaveBeenCalledOnce();

    await userEvent.keyboard(' ');
    await expect(handleClose).toHaveBeenCalledTimes(2);
    await expect(canvas.getByText('Removable label')).toBeVisible();
  },
};
