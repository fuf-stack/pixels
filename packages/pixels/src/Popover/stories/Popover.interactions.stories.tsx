import type { Story } from './Popover.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { meta as sharedMeta } from './Popover.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Popover/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardInteraction: Story = {
  args: {
    children: 'Open details',
    header: 'Details',
    content: <input aria-label="Note" />,
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open details',
    });
    const body = within(document.body);
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(body.getByRole('dialog', { name: 'Details' })).toHaveFocus();
    await userEvent.tab();
    await expect(body.getByRole('textbox', { name: 'Note' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  },
};
