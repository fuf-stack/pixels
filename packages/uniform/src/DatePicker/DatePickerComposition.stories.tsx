import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import DatePicker from './DatePicker';
import meta, * as existing from './DatePicker.stories';

const compositionMeta: Meta<typeof DatePicker> = {
  ...meta,
  component: DatePicker,
  title: 'uniform/DatePicker/Composition',
};
export default compositionMeta;
type Story = StoryObj<typeof DatePicker>;

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

export const ConsumerLabelFont: Story = {
  args: {
    name: 'dateField',
    label: 'Custom date',
    className: { label: 'text-body text-danger' },
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
    const label = canvasElement.querySelector('[data-slot="label"]');
    await expect(label).toHaveClass('text-body', 'text-danger');
    await expect(label).not.toHaveClass('text-small');
    await expect(getComputedStyle(label as Element).fontSize).toBe('18px');
  },
};

export const HelpAndRequired: Story = {
  ...existing.Required,
  args: {
    ...existing.Required.args,
    description: 'Choose a date and time.',
    timeZone: 'UTC',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const month = canvas.getByRole('spinbutton', { name: /month/i });
    await expect(month).toHaveAccessibleDescription(
      expect.stringContaining('Choose a date and time.'),
    );
    await expect(month).toHaveAttribute('aria-required', 'true');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    await waitFor(async () => {
      await expect(month).toHaveFocus();
      await expect(month).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('datetimefield_error');
    await expect(month).toHaveAccessibleDescription(
      expect.stringContaining(error.textContent),
    );
  },
};

export const CalendarKeyboardAndTime: Story = {
  ...existing.WithInitialValue,
  args: { ...existing.WithInitialValue.args, timeZone: 'UTC' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /calendar/i });
    await userEvent.click(trigger);
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('dialog');
    const popup = within(dialog);
    const timeHour = popup.getByRole('spinbutton', { name: /hour/i });
    await expect(timeHour).toHaveAttribute('aria-valuenow', '10');
    await userEvent.click(timeHour);
    await userEvent.keyboard('{ArrowUp}');
    await expect(
      canvas.getByRole('spinbutton', { name: /hour/i }),
    ).toHaveAttribute('aria-valuenow', '11');
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    const nextPopup = within(await page.findByRole('dialog'));
    const nextMonth = nextPopup
      .getAllByRole('button', { name: /^next$/i })
      .find((button) => {
        return button.getAttribute('slot') === 'next';
      });
    if (!nextMonth) {
      throw new Error('Calendar next-month control missing');
    }
    await userEvent.click(nextMonth);
    await expect(nextPopup.getByRole('heading')).toHaveTextContent('June 2026');
    await userEvent.keyboard('{Escape}');
  },
};

export const CalendarLimitsAndTime: Story = {
  parameters: {
    formProps: { initialValues: { dateField: '2026-05-15T10:15:00.000Z' } },
  },
  args: {
    name: 'dateField',
    label: 'Bounded date',
    minValue: '2026-05-10T09:00:00Z',
    maxValue: '2026-05-20T17:00:00Z',
    timeZone: 'UTC',
    withTime: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /calendar/i }));
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('dialog');
    const popup = within(dialog);
    await expect(
      popup.getByRole('button', { name: /May 9, 2026/i }),
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(popup.getByRole('button', { name: /May 16, 2026/i }));
    await expect(dialog).toBeVisible();
    await expect(
      canvas.getByRole('spinbutton', { name: /day,/i }),
    ).toHaveAttribute('aria-valuenow', '16');
    await userEvent.keyboard('{Escape}');
  },
};
