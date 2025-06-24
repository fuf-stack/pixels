import type { Meta, StoryObj } from '@storybook/react';

import { FaEnvelope } from 'react-icons/fa';

import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'uniform/Input',
  component: Input,
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
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    name: 'inputField',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Some Label',
    name: 'inputField',
  },
};

export const WithInitialValue: Story = {
  parameters: { formProps: { initialValues: { inputField: 'initial value' } } },
  args: {
    name: 'inputField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('inputfield');
    const inputValue = input.getAttribute('value');
    await expect(inputValue).toBe('initial value');
  },
};

export const Required: Story = {
  parameters: {
    formProps: {
      validation: veto({
        inputField: vt.string(),
      }),
    },
  },
  args: {
    label: 'Input Field',
    name: 'inputField',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Input Field',
    name: 'inputField',
    disabled: true,
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        inputField: vt
          .string()
          .regex(
            /^[a-z0-9\s]+$/i,
            'Must only contain alphanumeric characters and spaces.',
          )
          .min(2)
          .optional(),
      }),
    },
  },
  args: {
    label: 'InvalidField',
    name: 'inputField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('inputfield');
    await userEvent.type(input, 'invälid', {
      delay: 100,
    });
    const inputInvalid = input.getAttribute('aria-invalid');
    await expect(inputInvalid).toBe('true');
  },
};

export const WithSelect: Story = {
  args: {
    name: 'inputField',
    startContent: <FaEnvelope />,
    endContent: (
      <select
        className="border-0 bg-transparent text-small text-default-400 outline-none"
        id="currency"
        name="currency"
      >
        <option>@fuf.cool</option>
        <option>@gmail.com</option>
        <option>@pixelpost.org</option>
      </select>
    ),
  },
};

export const Number: Story = {
  parameters: {
    formProps: {
      validation: veto({
        numberField: vt.number(),
      }),
    },
  },
  args: {
    label: 'Number Field',
    name: 'numberField',
    type: 'number',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('numberfield');
    await userEvent.type(input, '2', {
      delay: 100,
    });

    await expect(input.getAttribute('aria-invalid')).toBeNull();
  },
};

export const Password: Story = {
  parameters: {
    formProps: {
      validation: veto({
        passwordField: vt.string({ min: 20 }),
      }),
    },
  },
  args: {
    label: 'Password Field',
    name: 'passwordField',
    type: 'password',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('passwordfield');
    await userEvent.type(input, 'veryS3cure!', {
      delay: 100,
    });

    await expect(input.getAttribute('aria-invalid')).toBe('true');
  },
};

const renderAllSizes = () =>
  ['sm', 'md', 'lg'].map((size) => (
    <Input
      className="mt-4"
      name={size}
      placeholder={size}
      // @ts-expect-error this is ok
      size={size}
    />
  ));

export const AllSizes: Story = {
  // @ts-expect-error this is ok
  render: renderAllSizes,
};
