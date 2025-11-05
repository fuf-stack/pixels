import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import Radios from './Radios';

const meta: Meta<typeof Radios> = {
  title: 'uniform/Radios',
  component: Radios,
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
type Story = StoryObj<typeof Radios>;

export const Default: Story = {
  args: {
    name: 'radiosField',
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
    name: 'radiosField',
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radiosField: 'option 2' } },
  },
  args: {
    name: 'radiosField',
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'radiosField',
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
    name: 'radiosField',
    options: [
      { value: 'option 1' },
      { value: 'disabled option', disabled: true },
      { value: 'option 3' },
    ],
  },
};

const requiredValidation = veto({
  radiosField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'radiosField',
    name: 'radiosField',
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
        radiosField: string().refine((value) => {
          return value !== 'two';
        }, 'Please use another option'),
      }),
    },
  },
  args: {
    name: 'radiosField',
    label: 'radiosField',
    options: [{ value: 'one' }, { value: 'two' }, { value: 'three' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionOne = canvas.getByTestId('radiosfield_option_one');
    await userEvent.click(optionOne, {
      delay: 100,
    });
    const optionTwo = canvas.getByTestId('radiosfield_option_two');
    await userEvent.click(optionTwo, {
      delay: 100,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield_error')).toBeVisible();
    });
  },
};
