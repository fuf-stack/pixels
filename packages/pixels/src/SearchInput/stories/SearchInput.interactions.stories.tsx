import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, userEvent, within } from 'storybook/test';

import SearchInput from '../SearchInput';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof SearchInput> = {
  title: 'pixels/SearchInput/Interactions',
  component: SearchInput,
  args: { onChange: fn(), testId: 'inputField' },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardClear: Story = {
  args: { initialValue: 'Find projects' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    input.focus();

    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await userEvent.type(input, 'a');
    await userEvent.keyboard('{Backspace}');
    await expect(args.onChange).toHaveBeenLastCalledWith('');
  },
};

export const PointerClear: Story = {
  args: { initialValue: 'Find projects' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'clear input' }));

    await expect(canvas.getByRole('textbox')).toHaveValue('');
    await expect(canvas.getByRole('textbox')).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
  },
};
