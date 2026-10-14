import type { Meta, StoryObj } from '@storybook/react-vite';
import type Switch from './Switch';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import meta, { Required } from './Switch.stories';

const compositionMeta: Meta<typeof Switch> = {
  ...meta,
  title: 'uniform/Switch/Composition',
};
export default compositionMeta;
type Story = StoryObj<typeof Switch>;

export const KeyboardAndRequired: Story = {
  ...Required,
  args: { ...Required.args, description: 'Toggle with Space.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('switch', { name: '🚀 Deploy on Friday' });
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await expect(input).toHaveAccessibleDescription('Toggle with Space.');
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).toHaveFocus();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    await userEvent.keyboard(' ');
    await expect(input).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(input).not.toBeChecked();
    await userEvent.tab();
  },
};
