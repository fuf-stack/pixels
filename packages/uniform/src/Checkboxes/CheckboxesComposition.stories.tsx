import type { Meta, StoryObj } from '@storybook/react-vite';
import type Checkboxes from './Checkboxes';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import meta, { Required } from './Checkboxes.stories';

export default {
  ...meta,
  title: 'uniform/Checkboxes/Composition',
} satisfies Meta<typeof Checkboxes>;

export const KeyboardAndRequired: StoryObj<typeof Checkboxes> = {
  ...Required,
  args: { ...Required.args, description: 'Choose at least one.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group');
    await expect(group).toHaveAccessibleDescription(
      'Choose at least one. Required selection.',
    );
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    const checkbox = canvas.getAllByRole('checkbox')[0];
    await waitFor(async () => {
      await expect(checkbox).toHaveFocus();
      await expect(group).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('checkboxfield_error');
    await expect(checkbox).toHaveAccessibleDescription(
      `Choose at least one. ${error.textContent} Required selection.`,
    );
    await expect(checkbox).not.toHaveAttribute('required');
    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
  },
};

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['option'] }] } },
});
export const ConsumerOptionFont: StoryObj<typeof Checkboxes> = {
  args: {
    name: 'choice',
    label: 'Choice',
    options: [{ value: 'first', label: 'First' }],
    className: { optionLabel: 'text-option' },
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
    const input = within(canvasElement).getByRole('checkbox', {
      name: 'First',
    });
    const label = input.closest('label')?.querySelector('[data-slot="label"]');
    await expect(label).toHaveClass('text-option');
    await expect(label).not.toHaveClass('text-medium');
    await expect(getComputedStyle(label as HTMLElement).fontSize).toBe('18px');
  },
};
