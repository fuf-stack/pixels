import type { Story } from './Tabs.storySetup';

import { expect, fn, userEvent, within } from 'storybook/test';

import { meta as sharedMeta } from './Tabs.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Tabs/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardSelection: Story = {
  args: {
    ariaLabel: 'Keyboard sections',
    onSelectionChange: fn(),
    tabs: [
      { key: 'one', label: 'One', content: 'First section' },
      {
        key: 'disabled',
        label: 'Unavailable',
        content: 'Hidden',
        disabled: true,
      },
      { key: 'three', label: 'Three', content: 'Third section' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('tab', { name: 'One' }).focus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Three' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: 'Three' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Third section',
    );
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith('three');
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Three' })).toHaveFocus();
  },
};

export const VerticalKeyboard: Story = {
  ...KeyboardSelection,
  args: { ...KeyboardSelection.args, vertical: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('tab', { name: 'One' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('tab', { name: 'Three' })).toHaveFocus();
    await expect(canvas.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  },
};
