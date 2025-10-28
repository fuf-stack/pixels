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

export const Clearable: Story = {
  args: {
    name: 'inputField',
    clearable: true,
    onClear: action('onClear'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('inputfield');
    await userEvent.type(input, 'I can be cleared');
    const clearButton = canvas.getByLabelText('clear input');
    expect(clearButton).toBeVisible();
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
        className="border-0 bg-transparent text-default-400 outline-none text-small"
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

export const CustomStyles: Story = {
  parameters: {
    formProps: { initialValues: { partySearch: 'Something fun!' } },
  },
  args: {
    clearable: true,
    name: 'partySearch',
    onClear: action('onClear'),
    placeholder: 'Search with party vibes...',
  },
  render: (args) => {
    return (
      <Input
        className={{
          inputWrapper: [
            // rounded corners and padding
            'rounded-2xl px-4',
            // transition styles
            'transition-colors duration-500',
            // background gradient (stronger in light mode)
            'bg-gradient-to-r from-fuchsia-100 via-rose-100 to-amber-100 dark:from-fuchsia-900 dark:via-rose-900 dark:to-amber-900',
            // background hover gradient
            'data-[hover=true]:bg-gradient-to-r data-[hover=true]:from-emerald-50 data-[hover=true]:via-teal-50 data-[hover=true]:to-lime-50 dark:data-[hover=true]:from-emerald-900 dark:data-[hover=true]:via-teal-900 dark:data-[hover=true]:to-lime-900',
            // border styles
            'border-2 border-fuchsia-400',
            // border hover styles (greenish)
            'data-[hover=true]:border-emerald-400',
            // border focus styles
            'group-data-[focus=true]:border-amber-400',
            // text color
            'text-fuchsia-700 group-hover:text-emerald-500 dark:text-fuchsia-300',
          ],
          // input placeholder color
          input:
            'placeholder:text-fuchsia-400/70 dark:placeholder:text-fuchsia-500/60',
          // clear button color
          clearButton:
            'text-fuchsia-500 transition-colors duration-500 hover:text-emerald-500',
        }}
        {...args}
      />
    );
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
        return String(value).replace('🤡', '').trim();
      },
      toFormValue: (value: string) => {
        // Always add clown emoji to form value
        return `${value.trim()} 🤡`.trim();
      },
    },
  },
};

interface Superhero {
  name: string;
  emoji: string;
  power: string;
}

const superheroData: Record<string, Superhero> = {
  spiderman: { name: 'Spider-Man', emoji: '🕷️', power: 'Web-slinging' },
  batman: { name: 'Batman', emoji: '🦇', power: 'Detective skills' },
  superman: { name: 'Superman', emoji: '💪', power: 'Super strength' },
  wonderwoman: { name: 'Wonder Woman', emoji: '⚡', power: 'Combat mastery' },
  ironman: { name: 'Iron Man', emoji: '🤖', power: 'Powered armor' },
  thor: { name: 'Thor', emoji: '⚡', power: 'Thunder god' },
  hulk: { name: 'Hulk', emoji: '💥', power: 'Smash everything' },
  blackpanther: { name: 'Black Panther', emoji: '🐱', power: 'Vibranium suit' },
};

export const WithTransformComplexObject: Story = {
  parameters: {
    formProps: {
      initialValues: {
        hero: {
          name: 'Spider-Man',
          emoji: '🕷️',
          power: 'Web-slinging',
        },
      },
    },
  },
  args: {
    label: 'Superhero Name (stored as object with emoji & power)',
    name: 'hero',
    placeholder: 'Try: spiderman, batman, superman...',
    transform: {
      // Form stores object with emoji and power, display just the name
      toDisplayValue: (value) => {
        const hero = value as Superhero;
        return hero?.name || '';
      },
      // Display is name string, convert to object with emoji and power
      toFormValue: (value: string) => {
        const heroKey = value.toLowerCase().replace(/[^a-z]/g, '');
        return (
          superheroData[heroKey] || {
            name: value || null,
            emoji: '🤷',
            power: 'Being mysterious',
          }
        );
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
      expect(canvas.getByText('Field is required')).toBeInTheDocument();
    });
  },
};
