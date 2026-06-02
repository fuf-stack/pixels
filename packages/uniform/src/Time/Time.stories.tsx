import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import Time from './Time';

const meta: Meta<typeof Time> = {
  title: 'uniform/Time',
  component: Time,
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
type Story = StoryObj<typeof Time>;

export const Default: Story = {
  args: {
    label: 'Time',
    name: 'timeField',
  },
};

export const Required: Story = {
  parameters: {
    formProps: {
      validation: veto({
        timeField: string(),
      }),
    },
  },
  args: {
    label: 'Required time',
    name: 'timeField',
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: {
      initialValues: { timeField: '10:15Z' },
    },
  },
  args: {
    label: 'With initial value',
    name: 'timeField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('timefield');
    await expect(input).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled time',
    name: 'timeField',
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        timeField: string()
          .refine((value) => {
            return value !== '10:15Z';
          }, 'Please choose another time')
          .nullable()
          .optional(),
      }),
      initialValues: { timeField: '10:15Z' },
    },
  },
  args: {
    label: 'Invalid time',
    name: 'timeField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton, { delay: 100 });

    await waitFor(() => {
      expect(canvas.getByTestId('timefield_error')).toBeVisible();
    });
  },
};

export const TwelveHourCycle: Story = {
  args: {
    hourCycle: 12,
    label: 'Time (12-hour cycle)',
    name: 'timeField',
  },
};

export const HourGranularity: Story = {
  args: {
    granularity: 'hour',
    label: 'Time (hour granularity)',
    name: 'timeField',
  },
};

export const HourAsNumber: Story = {
  parameters: {
    formProps: {
      initialValues: { hourField: 10 },
    },
  },
  args: {
    hourAsNumber: true,
    label: 'Time (stored as hour number)',
    name: 'hourField',
  },
};

export const HideTimeZone: Story = {
  parameters: {
    formProps: {
      initialValues: { timeField: '10:15Z' },
    },
  },
  args: {
    hideTimeZone: true,
    label: 'Time (timezone hidden)',
    name: 'timeField',
  },
};

export const WithCustomTimeZone: Story = {
  parameters: {
    formProps: {
      initialValues: { timeField: '10:15Z' },
    },
  },
  args: {
    label: 'Time (New York)',
    name: 'timeField',
    timeZone: 'America/New_York',
  },
};

export const WithUtcTimeZone: Story = {
  parameters: {
    formProps: {
      initialValues: { timeField: '10:15Z' },
    },
  },
  args: {
    label: 'Time (UTC)',
    name: 'timeField',
    timeZone: 'UTC',
  },
};
