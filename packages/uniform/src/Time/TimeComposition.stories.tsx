import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import Time from './Time';
import meta, * as existing from './Time.stories';

const compositionMeta: Meta<typeof Time> = {
  ...meta,
  component: Time,
  title: 'uniform/Time/Composition',
};
export default compositionMeta;
type Story = StoryObj<typeof Time>;

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

export const ConsumerSegmentFont: Story = {
  args: {
    name: 'timeField',
    label: 'Custom time',
    className: { input: 'text-body', segment: 'text-danger' },
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
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('timefield');
    await expect(input).toHaveClass('text-body');
    await expect(input).not.toHaveClass('text-small');
    const segment = canvas.getAllByRole('spinbutton')[0];
    await expect(segment).toHaveClass('text-danger');
    await expect(getComputedStyle(segment).fontSize).toBe('18px');
  },
};

export const HelpAndRequired: Story = {
  ...existing.Required,
  args: { ...existing.Required.args, description: 'Use UTC.', timeZone: 'UTC' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hour = canvas.getByRole('spinbutton', {
      name: /hour, Required time/i,
    });
    await expect(hour).toHaveAccessibleDescription(
      expect.stringContaining('Use UTC.'),
    );
    await expect(hour).toHaveAttribute('aria-required', 'true');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    await waitFor(async () => {
      await expect(hour).toHaveFocus();
      await expect(hour).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('timefield_error');
    await expect(hour).toHaveAccessibleDescription(
      expect.stringContaining(error.textContent),
    );
  },
};
