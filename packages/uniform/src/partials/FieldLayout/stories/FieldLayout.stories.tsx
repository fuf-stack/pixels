import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, KeyboardEvent } from 'react';

import {
  Button,
  Input,
  Label,
  NumberField,
  Radio,
  RadioGroup,
  TextField,
} from 'react-aria-components';

import { expect, userEvent, within } from 'storybook/test';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import FieldValidationError from '../../FieldValidationError';
import FieldLayout from '../FieldLayout';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const storyVariants = tv({
  slots: {
    /** Field root supplied by the story */
    base: 'flex w-72 flex-col gap-1',
    /** Editable control supplied as children */
    control: 'rounded-small border border-default-300 bg-transparent px-3 py-2',
    /** Supporting text below the control */
    description: 'text-foreground-500 text-small',
    /** Container for validation messages */
    errorMessage: 'text-danger text-small',
    /** Container grouping help text and validation messages */
    helperWrapper: 'flex flex-col gap-1',
    /** Label above the control */
    label: 'font-medium text-small',
    /** Buttons for increasing or decreasing the value */
    stepperButton: 'rounded-small border border-default-300 px-2 py-1',
  },
});

// classNames from slots
const variants = storyVariants();
const classNames = variantsToClassNames(variants);

const getControlProps = ({
  description,
  ids,
  invalid,
  label,
  required,
}: ComponentProps<typeof FieldLayout<'div'>>) => {
  return {
    id: ids.control,
    'aria-label': label ? undefined : 'Email',
    'aria-labelledby': label ? ids.label : undefined,
    'aria-describedby':
      [
        description ? ids.description : undefined,
        invalid ? ids.error : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    'aria-invalid': invalid || undefined,
    'aria-required': required ? true : undefined,
  };
};

const meta: Meta<typeof FieldLayout<'div'>> = {
  title: 'uniform/partials/FieldLayout',
  component: FieldLayout,
  args: {
    className: classNames,
    description: 'Use your work email',
    errorMessage: (
      <FieldValidationError
        error={[{ type: 'custom', message: 'Enter a valid email address' }]}
        testId="email"
      />
    ),
    ids: {
      control: 'email',
      label: 'email-label',
      description: 'email-description',
      error: 'email-error',
    },
    invalid: false,
    label: 'Email',
  },
  render: (args) => {
    return (
      <FieldLayout {...args}>
        <input {...getControlProps(args)} className={classNames.control} />
      </FieldLayout>
    );
  },
};

export default meta;
type Story = StoryObj<typeof FieldLayout<'div'>>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Email' });

    await userEvent.click(canvas.getByText('Email'));

    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription('Use your work email');
    await expect(
      canvas.queryByText('Enter a valid email address'),
    ).not.toBeInTheDocument();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox')).toHaveAccessibleName('Email');
    await expect(canvas.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription(
      'Use your work email Enter a valid email address',
    );
  },
};

export const ErrorOnly: Story = {
  args: { description: undefined, invalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Enter a valid email address');
    await expect(
      canvasElement.querySelector('[data-slot="description"]'),
    ).toBeNull();
  },
};

export const WithoutLabel: Story = {
  args: { label: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox')).toHaveAccessibleName('Email');
    await expect(canvasElement.querySelector('label')).toBeNull();
  },
};

export const BaseInteractions: Story = {
  render: (args) => {
    // route keyboard entry from the group to its editable control
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && event.target === event.currentTarget) {
        event.currentTarget.querySelector('input')?.focus();
      }
    };

    return (
      <FieldLayout
        {...args}
        baseProps={{
          'aria-labelledby': args.ids.label,
          onKeyDown: handleKeyDown,
          role: 'group',
          tabIndex: 0,
        }}
      >
        <input {...getControlProps(args)} className={classNames.control} />
      </FieldLayout>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Email' });

    group.focus();
    await userEvent.keyboard('{Enter}');

    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveFocus();
    await expect(group).toHaveClass('w-72');
    await expect(group).toHaveAttribute('data-slot', 'base');
  },
};

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

export const InTextField: Story = {
  render: (args) => {
    return (
      <FieldLayout<typeof TextField>
        {...args}
        baseAs={TextField}
        baseProps={{
          ...getControlProps(args),
          defaultValue: 'name@example.com',
          isInvalid: args.invalid,
          isRequired: args.required,
          validationBehavior: 'aria',
        }}
      >
        <Input className={classNames.control} />
      </FieldLayout>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Email' });

    await userEvent.click(canvas.getByText('Email'));
    await userEvent.type(input, '!');

    await expect(input).toHaveFocus();
    await expect(input).toHaveValue('name@example.com!');
    await expect(input).toHaveAccessibleDescription('Use your work email');
  },
};

export const InNumberField: Story = {
  args: { label: 'Amount', description: 'Number of seats' },
  render: (args) => {
    return (
      <FieldLayout<typeof NumberField>
        {...args}
        baseAs={NumberField}
        baseProps={{
          ...getControlProps(args),
          defaultValue: 0,
          isInvalid: args.invalid,
          isRequired: args.required,
          validationBehavior: 'aria',
        }}
      >
        <div className="flex items-center gap-2">
          <Button
            aria-label="Decrease"
            className={classNames.stepperButton}
            slot="decrement"
          >
            −
          </Button>
          <Input className={classNames.control} />
          <Button
            aria-label="Increase"
            className={classNames.stepperButton}
            slot="increment"
          >
            +
          </Button>
        </div>
      </FieldLayout>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Amount');

    await expect(input).toHaveValue('0');
    await expect(input).toHaveAccessibleDescription('Number of seats');

    await userEvent.click(canvas.getByRole('button', { name: 'Increase' }));

    await expect(input).toHaveValue('1');

    await userEvent.click(canvas.getByRole('button', { name: 'Decrease' }));

    await expect(input).toHaveValue('0');
  },
};

export const InRadioGroup: Story = {
  args: {
    className: { ...classNames, base: undefined },
    label: 'Delivery',
    labelAs: Label,
    description: 'Choose a delivery method',
  },
  render: (args) => {
    return (
      <FieldLayout<typeof RadioGroup>
        {...args}
        baseAs={RadioGroup}
        baseProps={{
          id: args.ids.control,
          isInvalid: args.invalid,
          isRequired: args.required,
          validationBehavior: 'aria',
        }}
      >
        <Radio value="email">Email</Radio>
        <Radio value="post">Post</Radio>
      </FieldLayout>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radiogroup', { name: 'Delivery' }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('radio', { name: 'Post' }));
    await expect(canvas.getByRole('radio', { name: 'Post' })).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Email' }),
    ).toHaveAccessibleName('Email');
  },
};
