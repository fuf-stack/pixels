import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useWatchUserChange } from '../hooks/useWatchUserChange';
import Input from '../Input';
import SubmitButton from '../SubmitButton';
import RadioTabs from './RadioTabs';

const meta: Meta<typeof RadioTabs> = {
  title: 'uniform/RadioTabs',
  component: RadioTabs,
  // TODO(#1873): Remove this exclusion when the runner isolation issue is fixed.
  // Both the JSDOM snapshot suite and Storybook's Chromium suite can deadlock
  // while advancing through this module. Individual stories often pass, but
  // the complete module is not reliable enough to run in CI yet.
  tags: ['test-exclude'],
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
type Story = StoryObj<typeof RadioTabs>;

const travelOptions = [
  { value: 'train', label: '🚆 Train' },
  { value: 'bike', label: '🚲 Bike' },
  { value: 'rocket', label: '🚀 Rocket' },
];

export const Default: Story = {
  args: {
    label: 'How do you get to work?',
    name: 'radioTabsField',
    options: travelOptions,
  },
};

export const NumberValues: Story = {
  args: {
    name: 'radioTabsField',
    options: [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 13, label: 'Unlucky' },
    ],
  },
};

export const WithContent: Story = {
  parameters: {
    formProps: {
      className: 'min-w-md',
      initialValues: { radioTabsField: 'train' },
    },
  },
  args: {
    label: 'How do you get to work?',
    name: 'radioTabsField',
    options: [
      {
        value: 'train',
        label: '🚆 Train',
        content: 'Reliable, with time to finish that book.',
      },
      {
        value: 'bike',
        label: '🚲 Bike',
        content: 'Fresh air and no traffic jams. Bring a rain jacket.',
      },
      {
        value: 'rocket',
        label: '🚀 Rocket',
        content: 'Fastest option. Parking might be tricky.',
      },
    ],
  },
};

interface PizzaFormData {
  toppings?: string;
  wantsPizza?: boolean;
}

export const BooleanValuesWithConditionalField: Story = {
  parameters: {
    formProps: {
      className: 'min-w-md',
      initialValues: { wantsPizza: false },
    },
  },
  render: () => {
    // Reset toppings when wantsPizza changes
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWatchUserChange<PizzaFormData>({
      watch: 'wantsPizza',
      onChange: (value, { resetField }) => {
        resetField('toppings');
      },
    });

    return (
      <RadioTabs
        label="Do you want pizza? 🍕"
        name="wantsPizza"
        options={[
          { label: 'No thanks 😢', value: false },
          {
            content: <Input label="What toppings?" name="toppings" />,
            label: 'Yes please! 🎉',
            value: true,
          },
        ]}
      />
    );
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radioTabsField: 'bike' } },
  },
  args: {
    label: 'How do you get to work?',
    name: 'radioTabsField',
    options: travelOptions,
  },
};

export const DisabledCompletely: Story = {
  parameters: {
    formProps: { initialValues: { radioTabsField: 'train' } },
  },
  args: {
    disabled: true,
    label: 'How do you get to work?',
    name: 'radioTabsField',
    options: travelOptions,
  },
};

export const ReadOnly: Story = {
  parameters: {
    formProps: { initialValues: { radioTabsField: 'bike' } },
  },
  args: {
    label: 'How do you get to work?',
    name: 'radioTabsField',
    options: travelOptions,
    readOnly: true,
  },
};

export const DisabledOption: Story = {
  args: {
    label: 'How do you get to work?',
    name: 'radioTabsField',
    options: [
      { value: 'train', label: '🚆 Train' },
      { value: 'bike', label: '🚲 Bike' },
      { value: 'rocket', label: '🚀 Rocket (out of fuel)', disabled: true },
    ],
  },
};

const requiredValidation = veto({
  radioTabsField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'How do you get to work?',
    name: 'radioTabsField',
    options: travelOptions,
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radioTabsField: string().refine((value) => {
          return value !== 'rocket';
        }, 'Rockets are not allowed in the city'),
      }),
    },
  },
  args: {
    name: 'radioTabsField',
    label: 'How do you get to work?',
    testId: 'radioTabsField',
    options: travelOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rocket = canvas.getByTestId('radiotabsfield_option_rocket');
    await userEvent.click(rocket, {
      delay: 100,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('radiotabsfield_error')).toBeVisible();
    });
  },
};

export const InvalidWithContent: Story = {
  parameters: {
    formProps: {
      className: 'min-w-md',
      validation: veto({
        radioTabsField: string().refine((value) => {
          return value !== 'pro';
        }, 'The Pro plan is sold out this month'),
      }),
    },
  },
  args: {
    label: 'Select Your Plan',
    name: 'radioTabsField',
    testId: 'radioTabsField',
    options: [
      {
        content: 'Perfect for individuals just getting started.',
        label: '🌱 Starter',
        value: 'starter',
      },
      {
        content: 'Great for growing teams and businesses.',
        label: '🚀 Pro',
        value: 'pro',
      },
      {
        content: 'For large organizations with advanced needs.',
        label: '🏢 Enterprise',
        value: 'enterprise',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pro = canvas.getByTestId('radiotabsfield_option_pro');
    await userEvent.click(pro, {
      delay: 100,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('radiotabsfield_error')).toBeVisible();
    });
  },
};

export const FullWidth: Story = {
  parameters: {
    formProps: {
      className: 'min-w-md',
      initialValues: { radioTabsField: 'train' },
    },
  },
  args: {
    label: 'How do you get to work?',
    fullWidth: true,
    name: 'radioTabsField',
    options: travelOptions,
  },
};
