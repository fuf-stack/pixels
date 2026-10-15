import type { Meta, StoryObj } from '@storybook/react-vite';
import type Slider from './Slider';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import meta, { Required } from './Slider.stories';

export default { ...meta, title: 'uniform/Slider/Composition' } satisfies Meta<
  typeof Slider
>;

export const HelpAndRequired: StoryObj<typeof Slider> = {
  ...Required,
  args: { ...Required.args, description: 'Choose an amount.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider');
    await expect(input).toHaveAccessibleDescription(
      'Choose an amount. Required selection.',
    );
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).toHaveFocus();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('sliderfield_error');
    await expect(input).toHaveAccessibleDescription(
      `Choose an amount. ${error.textContent} Required selection.`,
    );
    await userEvent.keyboard('{Home}');
    await expect(input).toHaveValue('0');
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    });
  },
};

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['field'] }] } },
});
export const ConsumerLabelFont: StoryObj<typeof Slider> = {
  args: {
    name: 'sliderField',
    label: 'Amount',
    className: { label: 'text-field', thumb: 'h-8 w-8' },
  },
  decorators: [
    (Story) => (
      <StylingProvider styling={styling}>
        <style>{'.text-field { font-size: 18px; }'}</style>
        <Story />
      </StylingProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('slider', { name: 'Amount' });
    const label = canvasElement.querySelector('[data-slot="label"]');
    const thumb = input.closest('[data-slot="thumb"]');
    await expect(label).toHaveClass('text-field');
    await expect(label).not.toHaveClass('text-sm');
    await expect(getComputedStyle(label as HTMLElement).fontSize).toBe('18px');
    await expect(thumb?.getBoundingClientRect().width).toBe(32);
  },
};
