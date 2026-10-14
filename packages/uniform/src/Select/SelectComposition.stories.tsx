import type { Meta, StoryObj } from '@storybook/react-vite';
import type Select from './Select';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import meta, { InitialValue, Required } from './Select.stories';

const compositionMeta: Meta<typeof Select> = {
  ...meta,
  title: 'uniform/Select/Composition',
};
export default compositionMeta;
type Story = StoryObj<typeof Select>;

export const HelpAndRequired: Story = {
  ...Required,
  args: { ...Required.args, description: 'Choose a flavor.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining('Choose a flavor.'),
    );
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).toHaveFocus();
    });
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('selectfield_error');
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining(error.textContent ?? ''),
    );
  },
};

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});
export const ConsumerFontSize: Story = {
  ...InitialValue,
  args: {
    ...InitialValue.args,
    className: { singleValue: 'text-body text-danger' },
  },
  decorators: [
    (Story) => (
      <StylingProvider styling={styling}>
        <style>{'.text-body { font-size: 18px; }'}</style>
        <Story />
      </StylingProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const value = canvasElement.querySelector('.text-body');
    await expect(value).toHaveClass('text-body', 'text-danger');
    await expect(value).not.toHaveClass('text-small');
    await expect(getComputedStyle(value as Element).fontSize).toBe('18px');
  },
};
