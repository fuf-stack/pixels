import type { Meta, StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import CheckboxGroup from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'uniform/CheckboxGroup',
  component: CheckboxGroup,
  decorators: [
    (Story, { parameters }) => (
      <Form
        onSubmit={action('onSubmit')}
        className="min-w-60"
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
type Story = StoryObj<typeof CheckboxGroup>;

export const Default: Story = {
  args: {
    name: 'checkboxField',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
};

export const Inline: Story = {
  args: {
    name: 'checkboxField',
    inline: true,
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
};

export const OnlyOneCheckbox: Story = {
  args: {
    name: 'checkboxField',
    options: [{ label: '1', value: '1' }],
  },
};

export const WithInitialValue: Story = {
  parameters: { formProps: { initialValues: { checkboxField: ['2'] } } },
  args: {
    name: 'checkboxField',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'checkboxField',
    disabled: true,
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'checkboxField',
    options: [
      { label: '1', value: '1' },
      { label: 'disabled', value: '2', disabled: true },
      { label: '3', value: '3' },
    ],
  },
};

const requiredValidation = veto({
  checkboxField: vt.array(vt.string()).min(1),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'checkboxField',
    name: 'checkboxField',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
};
const validation = veto({
  checkboxField: vt.array(vt.literal('1')).min(2),
});

export const Invalid: Story = {
  parameters: { formProps: { validation } },
  args: {
    label: 'checkboxField',
    name: 'checkboxField',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionTwo = canvas.getByTestId('checkboxfield_option_2');
    await userEvent.click(optionTwo, {
      delay: 500,
    });
    const inputInvalid = optionTwo.getAttribute('data-invalid');
    await expect(inputInvalid).toBe('true');
  },
};

export const InvalidOneCheckbox: Story = {
  parameters: {
    formProps: {
      validation: veto({
        checkboxField: vt
          .string()
          .refine((value) => value !== '1')
          .optional(),
      }),
    },
  },
  args: {
    label: 'checkboxField',
    name: 'checkboxField',
    options: [{ label: '1', value: '1' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionOne = canvas.getByTestId('checkboxfield_option_1');
    await userEvent.click(optionOne, {
      delay: 500,
    });
  },
};
