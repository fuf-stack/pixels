import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { userEvent, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import RadioGroup from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'uniform/RadioGroup',
  component: RadioGroup,
  decorators: [
    (Story, { parameters }) => {
      return (
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
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    name: 'radioGroupField',
    options: [
      { value: '1', label: 'option 1' },
      { value: '2', label: 'option 2' },
      { value: '3', label: 'option 3' },
    ],
  },
};

export const Inline: Story = {
  args: {
    inline: true,
    name: 'radioGroupField',
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radioGroupField: 'option 2' } },
  },
  args: {
    name: 'radioGroupField',
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'radioGroupField',
    disabled: true,
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'radioGroupField',
    options: [
      { value: 'option 1' },
      { value: 'disabled option', disabled: true },
      { value: 'option 3' },
    ],
  },
};

const requiredValidation = veto({
  radioGroupField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'radioGroupField',
    name: 'radioGroupField',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radioGroupField: string().refine((value) => {
          return value !== 'two';
        }, 'Please use another option'),
      }),
    },
  },
  args: {
    name: 'radioGroupField',
    label: 'radioGroupField',
    options: [{ value: 'one' }, { value: 'two' }, { value: 'three' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionOne = canvas.getByTestId('radiogroupfield_option_one');
    await userEvent.click(optionOne, {
      delay: 100,
    });
    const optionTwo = canvas.getByTestId('radiogroupfield_option_two');
    await userEvent.click(optionTwo, {
      delay: 100,
    });
  },
};
