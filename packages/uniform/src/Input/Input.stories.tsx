import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaEnvelope } from 'react-icons/fa';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { number, string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import SubmitButton from '../SubmitButton';
import Input from './Input';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Input> = {
  title: 'uniform/Input',
  component: Input,
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
    // Keep the edge-case explanation outside the form, as in the original stories.
    (Story, context) => {
      return context.parameters.edgeCaseDescription ? (
        edgeCaseDecorator(Story, context)
      ) : (
        <Story />
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

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

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    name: 'inputField',
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    const wrapper = input.closest('[data-slot="input-wrapper"]') as HTMLElement;

    await userEvent.hover(wrapper);
    await expect(wrapper).toHaveAttribute('data-hovered', 'true');
    await expect(wrapper).not.toHaveAttribute('data-hover');
    await userEvent.unhover(wrapper);
    await expect(wrapper).not.toHaveAttribute('data-hovered');
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
      expect(canvas.getByTestId('inputfield_error')).toBeVisible();
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
            'data-[hovered=true]:bg-gradient-to-r data-[hovered=true]:from-emerald-50 data-[hovered=true]:via-teal-50 data-[hovered=true]:to-lime-50 dark:data-[hovered=true]:from-emerald-900 dark:data-[hovered=true]:via-teal-900 dark:data-[hovered=true]:to-lime-900',
            // border styles
            'border-2 border-fuchsia-400',
            // border hover styles (greenish)
            'data-[hovered=true]:border-emerald-400',
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

export const AllSizes: Story = {
  // @ts-expect-error this is ok
  render: renderAllSizes,
};

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

export const ConsumerFontSize: Story = {
  args: {
    name: 'inputField',
    label: 'Custom font size',
    className: { input: 'text-body text-danger' },
  },
  decorators: [
    (Story) => {
      return (
        <StylingProvider styling={styling}>
          <style>{'.text-body { font-size: 18px; }'}</style>
          <Story />
        </StylingProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Custom font size',
    });
    await expect(input).toHaveClass('text-body', 'text-danger');
    await expect(input).not.toHaveClass('text-small');
    await expect(getComputedStyle(input).fontSize).toBe('18px');
  },
};

export const CustomStyling: Story = {
  parameters: {
    formProps: {
      initialValues: { amount: 0 },
      validation: veto({ amount: number().min(1, 'Choose at least one') }),
    },
  },
  args: {
    className: {
      base: 'max-w-sm',
      clearButton: 'text-primary',
      description: 'text-small',
      errorMessage: 'rounded-small bg-danger-50 p-2 text-danger-700 text-small',
      helperWrapper: 'gap-1 pt-2',
      innerWrapper: 'gap-2',
      input: 'font-semibold',
      inputWrapper: 'border-primary',
      label: 'font-semibold',
      stepper: 'gap-1',
      stepperButton: 'text-primary',
    },
    clearable: true,
    description: 'Number of items',
    label: 'Amount',
    name: 'amount',
    type: 'number',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('amount');

    await userEvent.click(canvas.getByRole('button', { name: 'Submit form' }));
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    const root = input.closest('[data-slot="base"]');
    await expect(root?.querySelector('[data-slot="label"]')).toHaveClass(
      'font-semibold',
    );
    await expect(root?.querySelector('[data-slot="description"]')).toHaveClass(
      'text-small',
    );
    await expect(
      root?.querySelector('[data-slot="error-message"]'),
    ).toHaveClass('bg-danger-50', 'p-2', 'text-small');
    await expect(
      root?.querySelector('[data-slot="stepper-wrapper"]'),
    ).toHaveClass('gap-1');
    await expect(
      canvas.getByRole('button', { name: /increase|increment/i }),
    ).toHaveClass('text-primary');
    await expect(
      canvas.getByRole('button', { name: /decrease|decrement/i }),
    ).toHaveClass('text-primary');
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription(
      'Number of items Choose at least one',
    );
  },
};

export const HelpAndRequired: Story = {
  ...Required,
  args: { ...Required.args, description: 'Enter a value.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Input Field' });
    await expect(input).toHaveAccessibleDescription('Enter a value.');
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await userEvent.click(input);
    await userEvent.tab();
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('inputfield_error');
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    const helper = input
      .closest('[data-slot="base"]')
      ?.querySelector('[data-slot="helper-wrapper"]');
    await expect(helper?.getBoundingClientRect().top).toBe(
      wrapper?.getBoundingClientRect().bottom,
    );
    await expect(input).toHaveAccessibleDescription(
      `Enter a value. ${error.textContent}`,
    );
  },
};

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const NullishNumber: Story = {
  name: 'Edge Cases: Nullish Number',
  parameters: {
    edgeCaseDescription:
      'A nullish number starts empty. Numeric zero remains visible and clearing returns to an empty control.',
    formProps: {
      initialValues: { numberField: null },
      validation: veto({ numberField: number().nullable().optional() }),
    },
  },
  args: {
    name: 'numberField',
    label: 'Nullable number',
    type: 'number',
    clearable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('numberfield');
    await expect(input).toHaveValue('');
    await userEvent.type(input, '0');
    await expect(input).toHaveValue('0');
    await userEvent.click(canvas.getByRole('button', { name: 'clear input' }));
    await waitFor(async () => {
      await expect(input).toHaveValue('');
    });
  },
};

// Test for edge case where validation error appears after clearing a field
export const ValidationAfterClear: Story = {
  name: 'Edge Cases: Cleared Validation',
  parameters: {
    edgeCaseDescription:
      'Clearing a required input shows its validation error after the value update and blur.',
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
