import type { Story } from './Progress.storySetup';

import { expect, userEvent, within } from 'storybook/test';

import { meta as sharedMeta, UpdatingExample } from './Progress.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Progress/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const UpdatingProgress: Story = {
  render: () => {
    return <UpdatingExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Advance' }));
    await expect(canvas.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    await expect(canvas.getByText('50%')).toBeVisible();
  },
};
