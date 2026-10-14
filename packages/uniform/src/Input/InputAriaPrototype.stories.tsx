import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import meta, * as existing from './Input.stories';
import InputAriaPrototype from './InputAriaPrototype';

const prototypeMeta: Meta<typeof InputAriaPrototype> = {
  ...meta,
  component: InputAriaPrototype,
  title: 'uniform/Input/Aria Prototype',
};
export default prototypeMeta;
type Story = StoryObj<typeof InputAriaPrototype>;

export const WithLabel: Story = { ...existing.WithLabel };
export const Required: Story = { ...existing.Required };
export const Disabled: Story = { ...existing.Disabled };
export const Invalid: Story = { ...existing.Invalid };
export const Number: Story = { ...existing.Number };
export const Clearable: Story = { ...existing.Clearable };
export const Transformed: Story = { ...existing.WithValueTransform };

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});
export const ConsumerFontSize: Story = {
  args: {
    name: 'inputField',
    label: 'Custom font size',
    className: { input: 'text-body text-danger' },
  },
  decorators: [
    (Story) => {
      return (
        <StylingProvider styling={styling}>
          <style>{'.text-body { font-size: 18px; }'}</style>
          <Story />
        </StylingProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Custom font size',
    });
    await expect(input).toHaveClass('text-body', 'text-danger');
    await expect(input).not.toHaveClass('text-small');
    await expect(getComputedStyle(input).fontSize).toBe('18px');
  },
};

export const HelpAndRequired: Story = {
  ...existing.Required,
  args: { ...existing.Required.args, description: 'Enter a value.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Input Field' });
    await expect(input).toHaveAccessibleDescription('Enter a value.');
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await userEvent.click(input);
    await userEvent.tab();
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('inputfield_error');
    await expect(input).toHaveAccessibleDescription(
      `Enter a value. ${error.textContent}`,
    );
  },
};
