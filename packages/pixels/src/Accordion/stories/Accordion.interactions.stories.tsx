import type { Story } from './Accordion.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { meta as sharedMeta } from './Accordion.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Accordion/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardExpansion: Story = {
  args: {
    accordionItems: [
      { title: 'First', children: 'First panel' },
      { title: 'Unavailable', children: 'Disabled panel', disabled: true },
      { title: 'Third', children: 'Third panel' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'First' });
    const third = canvas.getByRole('button', { name: 'Third' });

    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(third).toHaveFocus();
    await userEvent.keyboard('{Home}{Enter}');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await waitFor(async () => {
      await expect(canvas.getByRole('region', { name: 'First' })).toBeVisible();
    });

    await userEvent.keyboard('{End} ');
    await expect(third).toHaveFocus();
    await expect(third).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Home}{Enter}');
    await waitFor(async () => {
      await expect(
        canvas.queryByRole('region', { name: 'First' }),
      ).not.toBeInTheDocument();
    });
    await expect(canvas.getByRole('region', { name: 'Third' })).toBeVisible();
  },
};
