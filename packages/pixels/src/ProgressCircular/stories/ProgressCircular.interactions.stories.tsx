import type { Story } from './ProgressCircular.storySetup';

import { expect, userEvent, within } from 'storybook/test';

import {
  meta as sharedMeta,
  UpdatingExample,
} from './ProgressCircular.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/ProgressCircular/Interactions',
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
    await expect(
      canvas.getByRole('progressbar', { name: 'Upload progress' }),
    ).toHaveAttribute('aria-valuenow', '50');
    await expect(canvas.getByText('50%')).toBeVisible();
  },
};
