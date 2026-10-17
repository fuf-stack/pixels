import type { Story } from './Tooltip.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { meta as sharedMeta } from './Tooltip.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Tooltip/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardFocus: Story = {
  args: {
    children: <button type="button">More information</button>,
    content: 'Keyboard-accessible details',
    closeDelay: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'More information' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    const tooltip = await canvas.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent('Keyboard-accessible details');
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};
