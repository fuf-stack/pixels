import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import RadioTabs from './RadioTabs';

const meta: Meta<typeof RadioTabs> = {
  title: 'uniform/RadioTabs',
  component: RadioTabs,
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
type Story = StoryObj<typeof RadioTabs>;

export const Default: Story = {
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
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
      initialValues: { radioTabsField: 'option_1' },
    },
  },
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1', content: 'Option 1 Content' },
      { value: 'option_2', label: 'Option 2', content: 'Option 2 Content' },
      { value: 'option_3', label: 'Option 3', content: 'Option 3 Content' },
    ],
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radioTabsField: 'option_2' } },
  },
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'radioTabsField',
    disabled: true,
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      {
        value: 'option_2',
        label: 'option 2',
        disabled: true,
      },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

const requiredValidation = veto({
  radioTabsField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Radio Tabs Field',
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radioTabsField: string().refine((value) => {
          return value !== 'option_2';
        }, 'Please use another option'),
      }),
    },
  },
  args: {
    name: 'radioTabsField',
    label: 'Radio Tabs Field',
    testId: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionTwo = canvas.getByTestId('radiotabsfield_option_option_2');
    await userEvent.click(optionTwo, {
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
          return value !== 'option_2';
        }, 'This option is not allowed'),
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
        label: 'Starter',
        value: 'option_1',
      },
      {
        content: 'Great for growing teams and businesses.',
        label: 'Pro',
        value: 'option_2',
      },
      {
        content: 'For large organizations with advanced needs.',
        label: 'Enterprise',
        value: 'option_3',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionTwo = canvas.getByTestId('radiotabsfield_option_option_2');
    await userEvent.click(optionTwo, {
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
      initialValues: { radioTabsField: 'option_1' },
    },
  },
  args: {
    label: 'Radio Tabs Field',
    fullWidth: true,
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};
