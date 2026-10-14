import type { Meta, StoryObj } from '@storybook/react-vite';
import type Radios from './Radios';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { number, veto } from '@fuf-stack/veto';

import meta, { Required } from './Radios.stories';

export default { ...meta, title: 'uniform/Radios/Composition' } satisfies Meta<
  typeof Radios
>;

export const KeyboardAndRequired: StoryObj<typeof Radios> = {
  ...Required,
  parameters: { formProps: { validation: veto({ radiosField: number() }) } },
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

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['option'] }] } },
});
export const ConsumerOptionFont: StoryObj<typeof Radios> = {
  args: {
    name: 'radiosField',
    label: 'Choice',
    options: [{ label: 'Zero', value: 0 }],
    className: { itemLabel: 'text-option' },
  },
  decorators: [
    (Story) => (
      <StylingProvider styling={styling}>
        <style>{'.text-option { font-size: 18px; }'}</style>
        <Story />
      </StylingProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio', { name: 'Zero' });
    const label = radio.closest('label')?.querySelector('[data-slot="label"]');
    await expect(label).toHaveClass('text-option');
    await expect(label).not.toHaveClass('text-medium', 'text-sm');
    await expect(getComputedStyle(label as HTMLElement).fontSize).toBe('18px');
  },
};
