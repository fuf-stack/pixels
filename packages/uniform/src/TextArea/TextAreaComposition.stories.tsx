import type { Meta, StoryObj } from '@storybook/react-vite';
import type TextArea from './TextArea';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import meta, { Required } from './TextArea.stories';

const compositionMeta: Meta<typeof TextArea> = {
  ...meta,
  title: 'uniform/TextArea/Composition',
};
export default compositionMeta;
type Story = StoryObj<typeof TextArea>;

export const Autosizing: Story = {
  args: { name: 'textareaField', label: 'Autosizing text' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Autosizing text',
    });
    await waitFor(async () => {
      await expect(getComputedStyle(input).height).toBe('60px');
    });
    await userEvent.type(
      input,
      Array.from({ length: 10 }, (_, index) => {
        return `Line ${index + 1}`;
      }).join('{Enter}'),
    );
    await waitFor(async () => {
      await expect(getComputedStyle(input).height).toBe('160px');
    });
    await expect(input).not.toHaveAttribute('data-hide-scroll');
    await userEvent.clear(input);
    await waitFor(async () => {
      await expect(getComputedStyle(input).height).toBe('60px');
    });
    await expect(input).toHaveAttribute('data-hide-scroll', 'true');
  },
};

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

export const ConsumerFontSize: Story = {
  args: {
    name: 'textareaField',
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
  ...Required,
  args: { ...Required.args, description: 'Enter multiple lines.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Text Area' });
    await expect(input).toHaveAccessibleDescription('Enter multiple lines.');
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await userEvent.click(input);
    await userEvent.tab();
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('textareafield_error');
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    const helper = input
      .closest('[data-slot="base"]')
      ?.querySelector('[data-slot="helper-wrapper"]');
    await expect(helper?.getBoundingClientRect().top).toBe(
      wrapper?.getBoundingClientRect().bottom,
    );
    await expect(input).toHaveAccessibleDescription(
      `Enter multiple lines. ${error.textContent}`,
    );
  },
};
