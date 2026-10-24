import type { Story } from './Menu.storySetup';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { meta as sharedMeta } from './Menu.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Menu/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardNavigation: Story = {
  args: {
    children: 'Actions',
    disableAnimation: true,
    items: [
      { key: 'first', label: 'First' },
      { key: 'disabled', label: 'Disabled', disabled: true },
      { key: 'last', label: 'Last' },
    ],
    onAction: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    canvas.getByRole('button', { name: 'Actions' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(async () => {
      await expect(body.getByRole('menuitem', { name: 'First' })).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onAction).toHaveBeenCalledWith('last');
    await waitFor(async () => {
      await expect(body.queryByRole('menu')).not.toBeInTheDocument();
    });
  },
};
