import type { Story, Superhero } from './Input.storySetup';

import { FaEnvelope, FaKey } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { number, string, veto } from '@fuf-stack/veto';

import Input from '../Input';
import {
  renderAllSizes,
  meta as sharedMeta,
  styling,
  superheroData,
} from './Input.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'uniform/Input' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
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

export const PasswordVisibility: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
  },
  parameters: { formProps: { initialValues: { password: 'Example_123' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('password');
    const toggle = canvas.getByRole('button', { name: 'Show password' });
    await userEvent.click(input);
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveValue('Example_123');
    await expect(toggle).toHaveAccessibleName('Hide password');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveAttribute('type', 'password');
  },
};

export const PasswordWithoutToggle: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
    hidePasswordToggle: true,
  },
};

export const PasswordDisabled: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
    disabled: true,
  },
};

export const PasswordClearable: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
    clearable: true,
    endContent: <FaKey aria-hidden="true" />,
  },
  parameters: { formProps: { initialValues: { password: 'Example_123' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show password' }),
    );
    await expect(canvas.getByTestId('password')).toHaveAttribute(
      'type',
      'text',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'clear input' }));
    await expect(canvas.getByTestId('password')).toHaveValue('');
    await expect(canvas.getByTestId('password')).toHaveAttribute(
      'type',
      'password',
    );
    await expect(
      canvas.getByRole('button', { name: 'Show password' }),
    ).toBeVisible();
  },
};
