import type { Story } from './FieldReset.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  FieldResetForm,
  onSubmit,
  meta as sharedMeta,
} from './FieldReset.storySetup';

const meta: typeof sharedMeta = { ...sharedMeta, title: 'uniform/FieldReset' };

export default meta;

export const Default: Story = {};

export const IncludeAlways: Story = {
  render: () => {
    return <FieldResetForm always />;
  },
  play: async ({ canvasElement }) => {
    onSubmit.mockClear();
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: /CPU count/ }),
    ).toHaveValue('4');
    await expect(canvas.getByRole('textbox', { name: /Memory/ })).toHaveValue(
      '16',
    );
    await expect(canvas.getByRole('textbox', { name: /Note/ })).toHaveValue(
      'Current settings',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Submit form' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { cpuCount: 4, memory: 16, note: 'Current settings' },
        expect.anything(),
      );
    });
  },
};
