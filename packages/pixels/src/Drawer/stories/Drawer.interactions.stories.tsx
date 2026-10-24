import type { Story } from './Drawer.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { meta as sharedMeta } from './Drawer.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Drawer/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardDismissal: Story = {
  decorators: [
    (Story) => {
      return (
        <div className="flex gap-4">
          <button data-testid="keyboard-start" type="button">
            Start keyboard example
          </button>
          <Story />
        </div>
      );
    },
  ],
  args: {
    header: 'Drawer details',
    children: <button type="button">Drawer action</button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('drawer_trigger');
    const start = canvas.getByTestId('keyboard-start');

    start.focus();
    await expect(start).toHaveFocus();

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await canvas.findByRole('dialog', {
      name: 'Drawer details',
    });

    await userEvent.tab();
    await expect(dialog).toContainElement(
      document.activeElement as HTMLElement,
    );
    await userEvent.tab({ shift: true });
    await expect(dialog).toContainElement(
      document.activeElement as HTMLElement,
    );

    await userEvent.keyboard('{Escape}');
    // focus restoration runs on an animation frame after the exit finishes
    await waitFor(
      async () => {
        await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
        await expect(trigger).toHaveFocus();
      },
      { timeout: 5000 },
    );
  },
};
