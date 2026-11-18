import type { Story } from './FieldReset.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { onSubmit, meta as sharedMeta } from './FieldReset.storySetup';

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'uniform/FieldReset/Interactions',
};

export default meta;

export const Changed: Story = {
  tags: ['visual'],
  parameters: {
    visual: {
      target: '[data-component="field-reset"]:has(input[name="cpuCount"])',
    },
  },
  play: async ({ canvasElement }) => {
    onSubmit.mockClear();
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('form')).toHaveAttribute(
        'data-form-is-valid',
        'false',
      );
    });
    await expect(canvas.getByText('Cores')).toBeVisible();
    await expect(canvas.getByText('GB')).toBeVisible();
    const cpu = canvas.getByRole('textbox', { name: /CPU count/ });
    await userEvent.clear(cpu);
    await userEvent.type(cpu, '8');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Reset to original: cpuCount' }),
    ).toBeVisible();
    const reset = canvas.getByRole('button', {
      name: 'Reset to original: cpuCount',
    });
    await expect(reset.closest('[data-slot="input-wrapper"]')).toBe(
      cpu.closest('[data-slot="input-wrapper"]'),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Submit form' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ cpuCount: 8 }, expect.anything());
    });
  },
};

export const Reset: Story = {
  play: async (context) => {
    await Changed.play?.(context);
    const canvas = within(context.canvasElement);
    const reset = canvas.getByRole('button', {
      name: 'Reset to original: cpuCount',
    });
    reset.focus();
    await expect(reset).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('textbox', { name: /CPU count/ }),
    ).toHaveFocus();
    await expect(
      canvas.getByRole('textbox', { name: /CPU count/ }),
    ).toHaveValue('4');
    await waitFor(() => {
      expect(context.canvasElement.querySelector('form')).toHaveAttribute(
        'data-form-is-valid',
        'false',
      );
    });
  },
};
