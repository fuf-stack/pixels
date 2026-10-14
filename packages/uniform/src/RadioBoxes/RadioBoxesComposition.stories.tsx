import type { Meta, StoryObj } from '@storybook/react-vite';
import type RadioBoxes from './RadioBoxes';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { number, veto } from '@fuf-stack/veto';

import meta, { Required } from './RadioBoxes.stories';

export default {
  ...meta,
  title: 'uniform/RadioBoxes/Composition',
} satisfies Meta<typeof RadioBoxes>;

export const KeyboardAndRequired: StoryObj<typeof RadioBoxes> = {
  ...Required,
  parameters: {
    formProps: { validation: veto({ radioBoxesField: number() }) },
  },
  args: {
    ...Required.args,
    description: 'Choose with the arrow keys.',
    options: [
      { label: 'Zero', value: 0 },
      { label: 'Disabled', value: 1, disabled: true },
      { label: 'Two', value: 2 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAccessibleDescription(
      'Choose with the arrow keys.',
    );
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    const zero = canvas.getByRole('radio', { name: 'Zero' });
    await waitFor(async () => {
      await expect(zero).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Two' })).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Disabled' }),
    ).not.toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(zero).toBeChecked();
  },
};
