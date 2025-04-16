import type { Meta, StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import { userEvent, within } from '@storybook/test';

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
      { key: 'option_1', label: 'Option 1' },
      { key: 'option_2', label: 'Option 2' },
      { key: 'option_3', label: 'Option 3' },
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
      { key: 'option_1', label: 'Option 1' },
      { key: 'option_2', label: 'Option 2' },
      { key: 'option_3', label: 'Option 3' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'radioTabsField',
    disabled: true,
    options: [
      { key: 'option_1', label: 'Option 1' },
      { key: 'option_2', label: 'Option 2' },
      { key: 'option_3', label: 'Option 3' },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'radioTabsField',
    options: [
      { key: 'option_1', label: 'Option 1' },
      {
        key: 'option_2',
        label: 'option 2',
        disabled: true,
      },
      { key: 'option_3', label: 'Option 3' },
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
      { key: 'option_1', label: 'Option 1' },
      { key: 'option_2', label: 'Option 2' },
      { key: 'option_3', label: 'Option 3' },
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
    options: [
      { key: 'option_1', label: 'Option 1' },
      { key: 'option_2', label: 'Option 2' },
      { key: 'option_3', label: 'Option 3' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // const optionOne = canvas.getByTestId('radiogroupfield_option_one');
    const optionOne = canvas.getByText('Option 2');
    await userEvent.click(optionOne, {
      delay: 100,
    });
    // const optionTwo = canvas.getByTestId('radiogroupfield_option_two');
    // await userEvent.click(optionTwo, {
    //   delay: 100,
    // });
  },
};
