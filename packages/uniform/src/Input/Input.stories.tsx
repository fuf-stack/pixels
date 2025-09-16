import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaEnvelope } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { number, string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'uniform/Input',
  component: Input,
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
        inputField: string({ min: 1 }),
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
        inputField: string()
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
    input.blur();

    // Wait because of value debounce
    await waitFor(() => {
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });
  },
};

export const WithSelect: Story = {
  args: {
    name: 'inputField',
    startContent: <FaEnvelope />,
    endContent: (
      <select
        className="text-small text-default-400 border-0 bg-transparent outline-none"
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
        numberField: number(),
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
    input.blur();

    // Wait because of value debounce
    await waitFor(() => {
      expect(input.getAttribute('aria-invalid')).toBeNull();
    });
  },
};

export const Password: Story = {
  parameters: {
    formProps: {
      validation: veto({
        passwordField: string({ min: 20 }),
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
    input.blur();

    // Wait because of value debounce
    await waitFor(() => {
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });
  },
};

export const WithValueTransform: Story = {
  parameters: {
    formProps: {
      initialValues: { userName: 'john 🤡' },
    },
  },
  args: {
    label: 'Username',
    name: 'userName',
    placeholder: 'Enter username...',
    endContent: '🤡',
    transform: {
      toDisplayValue: (value) => {
        // Remove emoji for display
        return value.toString().replace('🤡', '').trim();
      },
      toFormValue: (value) => {
        // Always add clown emoji to form value
        return `${value.toString().trim()} 🤡`.trim();
      },
    },
  },
};

const renderAllSizes = () => {
  return ['sm', 'md', 'lg'].map((size) => {
    return (
      <Input
        key={size}
        className="mt-4"
        name={size}
        placeholder={size}
        // @ts-expect-error this is ok
        size={size}
      />
    );
  });
};

export const AllSizes: Story = {
  // @ts-expect-error this is ok
  render: renderAllSizes,
};

// Test for edge case where validation error appears after clearing a field
export const ValidationAfterClear: Story = {
  name: 'Edge Cases: Cleared Validation',
  parameters: {
    formProps: {
      validation: veto({
        inputField: string(),
      }),
    },
  },
  args: {
    label: 'Required Cleared Field',
    name: 'inputField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('inputfield');

    // Initially, no validation error should be shown
    await expect(input.getAttribute('aria-invalid')).toBeNull();

    // Type some content
    await userEvent.type(input, 'test', {
      delay: 50,
    });

    // Field should be valid with content
    await expect(input.getAttribute('aria-invalid')).toBeNull();

    // Clear the field completely
    await userEvent.clear(input);
    input.blur();

    // Wait because of value debounce
    await waitFor(() => {
      // Now validation error should appear for required field
      expect(input.getAttribute('aria-invalid')).toBe('true');

      // Check that error message is displayed
      expect(
        canvas.getByText('String must contain at least 1 character(s)'),
      ).toBeInTheDocument();
    });
  },
};
