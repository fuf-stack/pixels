import type { Story } from './Drawer.storySetup';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { meta as sharedMeta } from './Drawer.storySetup';

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Drawer/Edge Cases',
  decorators: [edgeCaseDecorator],
};

export default meta;

export const WithoutPointerDismissal: Story = {
  args: {
    children: 'Escape remains available',
    header: 'Keyboard dismissal',
    hideCloseButton: true,
    isDismissable: false,
  },
  parameters: {
    edgeCaseDescription:
      'Disabling backdrop dismissal and hiding the close button still leaves Escape available to dismiss the drawer.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('drawer_trigger'));
    const dialog = await canvas.findByRole('dialog', {
      name: 'Keyboard dismissal',
    });
    await expect(
      within(dialog).queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();

    const wrapper = dialog.closest('[data-slot="wrapper"]');
    if (!wrapper) {
      throw new Error('Missing drawer wrapper');
    }
    await userEvent.click(wrapper);
    await expect(dialog).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};
