import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { useState } from 'react';
import { Label } from 'react-aria-components';

import { expect, userEvent, within } from 'storybook/test';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import RadioControl from '../../../Radios/subcomponents/RadioControl';
import radioControlVariants from '../../../Radios/subcomponents/radioControlVariants';
import FieldLayout from '../../FieldLayout/FieldLayout';
import FieldValidationError from '../../FieldValidationError';
import RadioGroupField from '../RadioGroupField';
import radioGroupFieldVariants from '../radioGroupFieldVariants';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const ids = {
  control: 'delivery',
  label: 'delivery-label',
  description: 'delivery-description',
  error: 'delivery-error',
};
const storyVariants = tv({
  extend: radioGroupFieldVariants,
  slots: {
    /** Group label, options and supporting messages */
    base: 'group flex w-72 flex-col gap-2',
    /** Validation messages below the options */
    errorMessage: 'text-danger text-tiny',
    /** Options arranged in the requested direction */
    wrapper: 'flex flex-col gap-2 data-[orientation=horizontal]:flex-row',
  },
});
const variants = storyVariants();
const classNames = variantsToClassNames(variants);

const Example = ({
  className = undefined,
  disabled = undefined,
  value: initialValue,
  ...props
}: ComponentProps<typeof RadioGroupField>) => {
  const [value, setValue] = useState(initialValue);
  const { controlProps, inline, invalid, required } = props;
  const optionVariants = radioControlVariants({ invalid });
  const optionClassNames = variantsToClassNames(optionVariants);
  const describedBy = [ids.description, invalid ? ids.error : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <FieldLayout
      baseAs={RadioGroupField}
      baseProps={{
        ...props,
        controlProps: { ...controlProps, 'aria-describedby': describedBy },
        disabled,
        onChange: setValue,
        value,
      }}
      className={{ ...classNames, base: className ?? classNames.base }}
      description="Choose a delivery method"
      errorMessage={
        <FieldValidationError
          error={[{ type: 'required', message: 'Choose an available method' }]}
          testId="delivery"
        />
      }
      ids={ids}
      invalid={invalid}
      label={controlProps['aria-label'] ? undefined : 'Delivery'}
      labelAs={Label}
      required={required}
    >
      <div
        className={classNames.wrapper}
        data-orientation={inline ? 'horizontal' : 'vertical'}
        data-slot="wrapper"
      >
        <RadioControl
          className={optionClassNames}
          disabled={disabled}
          invalid={invalid}
          value="email"
        >
          Email
        </RadioControl>
        <RadioControl
          className={optionClassNames}
          description="Currently unavailable"
          disabled
          invalid={invalid}
          value="sms"
        >
          Text message
        </RadioControl>
        <RadioControl
          className={optionClassNames}
          disabled={disabled}
          invalid={invalid}
          value="post"
        >
          Post
        </RadioControl>
      </div>
    </FieldLayout>
  );
};

const meta: Meta<typeof RadioGroupField> = {
  title: 'uniform/partials/RadioGroupField',
  component: RadioGroupField,
  args: {
    children: null,
    controlProps: { id: ids.control },
    inline: false,
    inputRef: () => {},
    invalid: false,
    name: 'delivery',
    onBlur: () => {},
    onChange: () => {},
    required: false,
    testId: 'delivery',
    value: 'email',
  },
  render: (args) => {
    return <Example {...args} />;
  },
};
export default meta;
type Story = StoryObj<typeof RadioGroupField>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radiogroup', { name: 'Delivery' }),
    ).toHaveAccessibleDescription('Choose a delivery method');
    await userEvent.click(canvas.getByRole('radio', { name: 'Post' }));
    await expect(canvas.getByRole('radio', { name: 'Post' })).toBeChecked();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radiogroup', { name: 'Delivery' }),
    ).toHaveAttribute('aria-required', 'true');
    await expect(
      canvas.getByRole('radio', { name: 'Email' }),
    ).not.toHaveAttribute('required');
  },
};

export const Invalid: Story = {
  args: { invalid: true, required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radiogroup', { name: 'Delivery' }),
    ).toHaveAccessibleDescription(
      'Choose a delivery method Choose an available method',
    );
    await expect(
      canvas.getByRole('radio', { name: 'Post' }),
    ).toHaveAccessibleDescription(
      'Choose a delivery method Choose an available method',
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await Promise.all(
      within(canvasElement)
        .getAllByRole('radio')
        .map(async (radio) => {
          await expect(radio).toBeDisabled();
        }),
    );
  },
};

export const Horizontal: Story = { args: { inline: true } };

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

export const AccessibleName: Story = {
  args: { controlProps: { id: ids.control, 'aria-label': 'Delivery options' } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('radiogroup', {
        name: 'Delivery options',
      }),
    ).toBeInTheDocument();
  },
};
