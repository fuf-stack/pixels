import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import DatePicker from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'uniform/DatePicker',
  component: DatePicker,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className="min-w-60"
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
  args: {
    label: 'Disabled Date & Time',
    name: 'dateTimeField',
    disabled: true,
    withTime: true,
  },
};

export const Invalid: Story = {
  parameters: {
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
  parameters: {
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
