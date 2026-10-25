import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import DatePicker from '../DatePicker';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof DatePicker> = {
  title: 'uniform/DatePicker',
  component: DatePicker,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className={{ form: 'min-w-60' }}
          onSubmit={action('onSubmit')}
          {...(parameters?.formProps ?? {})}
        >
          <Story />
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    label: 'Date Only',
    name: 'dateField',
  },
};

export const WithTime: Story = {
  args: {
    label: 'Date & Time',
    name: 'dateTimeField',
    withTime: true,
  },
};

export const Required: Story = {
  parameters: {
    formProps: {
      validation: veto({
        dateTimeField: string(),
      }),
    },
  },
  args: {
    label: 'Required Date & Time',
    name: 'dateTimeField',
    withTime: true,
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: {
      initialValues: { dateTimeField: '2026-05-30T10:15:00.000Z' },
    },
  },
  args: {
    label: 'Date & Time',
    name: 'dateTimeField',
    withTime: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('datetimefield');
    await expect(input).toBeVisible();
  },
};

export const Disabled: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="date-picker"]' } },
  args: {
    label: 'Disabled Date & Time',
    name: 'dateTimeField',
    disabled: true,
    withTime: true,
  },
};

export const Invalid: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="date-picker"]' },
    formProps: {
      validation: veto({
        dateTimeField: string()
          .refine((value) => {
            return value !== '2026-05-30T10:15:00.000Z';
          }, 'Please choose another date')
          .nullable()
          .optional(),
      }),
      initialValues: { dateTimeField: '2026-05-30T10:15:00.000Z' },
    },
  },
  args: {
    label: 'Invalid Date & Time',
    name: 'dateTimeField',
    withTime: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton, { delay: 100 });

    await waitFor(() => {
      expect(canvas.getByTestId('datetimefield_error')).toBeVisible();
    });
  },
};

export const MinAndMaxValueWithoutTime: Story = {
  args: {
    label: 'Date Only (Min/Max)',
    name: 'dateField',
    // Bounds are always ISO strings; derive a moving +/- 5 day window from "now".
    maxValue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    minValue: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export const MinAndMaxValueWithTime: Story = {
  args: {
    label: 'Date & Time (Min/Max)',
    name: 'dateTimeField',
    withTime: true,
    // Time-enabled mode accepts full ISO timestamps; keep bounds relative to
    // current time so this story stays valid without hard-coded dates.
    maxValue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    minValue: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export const HideTimeZone: Story = {
  parameters: {
    formProps: {
      initialValues: { dateTimeField: '2026-05-30T10:15:00.000Z' },
    },
  },
  args: {
    label: 'Date & Time (Timezone Hidden)',
    name: 'dateTimeField',
    hideTimeZone: true,
    withTime: true,
  },
};

export const WithCustomTimeZone: Story = {
  parameters: {
    formProps: {
      initialValues: { dateTimeField: '2026-05-30T10:15:00.000Z' },
    },
  },
  args: {
    label: 'Date & Time (New York)',
    name: 'dateTimeField',
    timeZone: 'America/New_York',
    withTime: true,
  },
};

export const TwelveHourCycle: Story = {
  args: {
    hourCycle: 12,
    label: 'Date & Time (12-hour cycle)',
    name: 'dateTimeField',
    withTime: true,
  },
};

export const WithUtcTimeZone: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="date-picker"]' },
    formProps: {
      initialValues: { dateTimeField: '2026-05-30T10:15:00.000Z' },
    },
  },
  args: {
    label: 'Date & Time (UTC)',
    name: 'dateTimeField',
    timeZone: 'UTC',
    withTime: true,
  },
};

export const OpenCalendar: Story = {
  ...WithUtcTimeZone,
  tags: ['visual'],
  parameters: {
    ...WithUtcTimeZone.parameters,
    visual: {
      target: '[data-component="date-picker"], [role="dialog"]',
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /calendar/i }),
    );

    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );

    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByRole('heading')).toHaveTextContent(
      'May 2026',
    );
  },
};

// -----------------------------------------------------------------------------
// Composition
// -----------------------------------------------------------------------------

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
  ...Required,
  args: {
    ...Required.args,
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
  ...WithInitialValue,
  args: { ...WithInitialValue.args, timeZone: 'UTC' },
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
