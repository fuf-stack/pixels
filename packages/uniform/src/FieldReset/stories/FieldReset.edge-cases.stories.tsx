import type { Story } from './FieldReset.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FieldResetForm, meta as sharedMeta } from './FieldReset.storySetup';

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'uniform/FieldReset/Edge Cases',
};

export default meta;

export const ValidationError: Story = {
  render: () => {
    return <FieldResetForm requiredCpu />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cpu = canvas.getByRole('textbox', { name: /CPU count/ });
    await userEvent.clear(cpu);
    await userEvent.tab();
    await waitFor(() => {
      expect(canvas.getByText('Field is required')).toBeVisible();
    });
    const reset = canvas.getByRole('button', {
      name: 'Reset to original: cpuCount',
    });
    const inputWrapper = cpu.closest('[data-slot="input-wrapper"]');
    await expect(inputWrapper).not.toBeNull();
    await expect(inputWrapper).toContainElement(reset);
    await userEvent.click(reset);
    await expect(cpu).toHaveValue('4');
    await expect(cpu).toHaveFocus();
    await waitFor(() => {
      expect(canvas.queryByText('Field is required')).not.toBeInTheDocument();
    });
  },
};
