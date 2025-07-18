import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { userEvent, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import RadioTabs from './RadioTabs';

const meta: Meta<typeof RadioTabs> = {
  title: 'uniform/RadioTabs',
  component: RadioTabs,
  decorators: [
    (Story, { parameters }) => (
      <Form
        className="min-w-60"
        onSubmit={action('onSubmit')}
        {...(parameters?.formProps || {})}
      >
        <Story />
        <div className="mt-4 flex justify-end">
          <SubmitButton />
        </div>
      </Form>
    ),
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

export const WithContent: Story = {
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
  radioTabsField: vt.string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'radioTabsField',
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
        radioTabsField: vt
          .string()
          .refine((value) => value !== 'option_2', 'Please use another option'),
      }),
    },
  },
  args: {
    name: 'radioTabsField',
    label: 'radioTabsField',
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
  },
};
