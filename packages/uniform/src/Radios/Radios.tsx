import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactElement, ReactNode } from 'react';

import {
  Radio as HeroRadio,
  RadioGroup as HeroRadioGroup,
} from '@heroui/radio';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { createOptionValueConverter } from '../helpers';
import { useUniformField } from '../hooks/useUniformField';

export const radiosVariants = tv({
  slots: {
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
      // Keep spacing between label/group consistent.
      'gap-y-1.5',
    ],
    errorMessage: '',
    itemBase: '',
    itemControl: 'bg-focus group-data-[invalid=true]:bg-danger',
    itemDescription: '',
    itemLabel: 'text-sm',
    itemLabelWrapper: 'ml-2',
    itemWrapper:
      'group-data-[invalid=true]:border-danger! [&:not(group-data-[invalid="true"]):not(group-data-[selected="false"])]:border-focus',
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'mb-2 inline-flex cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    wrapper: '',
  },
});

type VariantProps = TVProps<typeof radiosVariants>;
type ClassName = TVClassName<typeof radiosVariants>;

export interface RadioOption {
  /** disables the option */
  disabled?: boolean;
  /** option label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** Arbitrary option metadata for custom render logic. */
  meta?: Record<string, unknown>;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string | number;
}

export interface RadioRenderedOption {
  /** Prebuilt radio element so consumers don't need to recreate HeroRadio */
  radio: ReactNode;
  /** Option data as provided in `options` */
  option: RadioOption;
  /** Render-state flags for this option */
  state: {
    /** Whether this option is currently selected */
    selected: boolean;
    /** Whether this option is disabled */
    disabled: boolean;
    /** Whether the radio group is invalid */
    invalid: boolean;
  };
}

export interface RadiosProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** Optional child render function for custom full-list layout rendering. */
  children?: (options: RadioRenderedOption[]) => ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Determines if the Buttons are disabled or not. */
  disabled?: boolean;
  /** determines orientation of the Buttons. */
  inline?: boolean;
  /** Label displayed next to the RadioButton. */
  label?: ReactNode;
  /** Name the RadioButtons are registered at in HTML forms (react-hook-form). */
  name: string;
  /** Radio button configuration. */
  options: RadioOption[];
  /** Id to grab element in internal tests. */
  testId?: string;
}

/**
 * Radios component based on [HeroUI RadioGroup](https://www.heroui.com//docs/components/radio-group)
 */
const Radios = ({
  children = undefined,
  className = undefined,
  inline = false,
  name,
  options,
  ...uniformFieldProps
}: RadiosProps): ReactElement => {
  const {
    ariaLabel,
    disabled,
    errorMessage,
    field: { onBlur, onChange, ref, value },
    invalid,
    label,
    required,
    testId,
  } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  // Create converter to preserve number types for option values
  const { convertToOriginalType } = createOptionValueConverter(options);

  // classNames from slots
  const variants = radiosVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  const itemClassNames = {
    base: classNames.itemBase,
    control: classNames.itemControl,
    description: classNames.itemDescription,
    label: classNames.itemLabel,
    labelWrapper: classNames.itemLabelWrapper,
    wrapper: classNames.itemWrapper,
  };

  const selectedValue = value != null ? String(value) : '';

  // Build option descriptors once so default and custom layouts share the same radio nodes/state.
  const renderedOptions = options.map((option) => {
    const optionTestId = slugify(
      `${testId}_option_${option.testId ?? option.value}`,
      { replaceDots: true },
    );
    const optionIsDisabled = !!disabled || !!option.disabled;
    const optionValue = String(option.value);
    const radio = (
      <HeroRadio
        key={optionValue}
        classNames={itemClassNames}
        data-testid={optionTestId}
        isDisabled={optionIsDisabled}
        value={optionValue}
      >
        {option.label ?? option.value}
      </HeroRadio>
    );

    return {
      option,
      radio,
      state: {
        selected: selectedValue === optionValue,
        disabled: optionIsDisabled,
        invalid: !!invalid,
      },
    };
  });

  return (
    <HeroRadioGroup
      ref={ref}
      aria-label={ariaLabel}
      classNames={classNames}
      // see HeroUI styles for group-data condition (data-invalid),
      // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      errorMessage={errorMessage}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      label={label ? <legend>{label}</legend> : null}
      name={name}
      onBlur={onBlur}
      onValueChange={(newValue) => {
        onChange(convertToOriginalType(newValue));
      }}
      orientation={inline ? 'horizontal' : 'vertical'}
      value={selectedValue}
    >
      {/* Child render function can fully control list layout; fallback keeps default rendering. */}
      {children
        ? children(renderedOptions)
        : renderedOptions.map(({ radio }) => {
            return radio;
          })}
    </HeroRadioGroup>
  );
};

export default Radios;
