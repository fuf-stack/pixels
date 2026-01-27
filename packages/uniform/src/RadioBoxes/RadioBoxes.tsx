import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
//
import type { RadioBoxProps } from './RadioBox';

import { RadioGroup as HeroRadioGroup } from '@heroui/radio';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { createOptionValueConverter } from '../helpers';
import { useUniformField } from '../hooks/useUniformField';
import { RadioBox } from './RadioBox';

export const radioBoxesVariants = tv({
  slots: {
    base: 'group gap-0', // Needs group for group-data condition
    boxBase: '',
    boxControl: '',
    boxDescription: '',
    boxLabel: '',
    boxLabelWrapper: '',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'mb-2 inline-flex text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    wrapper: '',
  },
});

type VariantProps = TVProps<typeof radioBoxesVariants>;
type ClassName = TVClassName<typeof radioBoxesVariants>;

export interface RadioBoxesOption {
  /** Description of the value. Works with variant radioBox. */
  description?: ReactNode;
  /** disables the option */
  disabled?: boolean;
  /** option label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string | number;
}

export interface RadioBoxesProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
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
  options: RadioBoxesOption[];
  /** Id to grab element in internal tests. */
  testId?: string;
}

/**
 * RadioBoxes component based on [HeroUI RadioGroup](https://www.heroui.com//docs/components/radio-group)
 */
const RadioBoxes = ({
  className = undefined,
  inline = false,
  name,
  options,
  ...uniformFieldProps
}: RadioBoxesProps) => {
  const {
    ariaLabel,
    errorMessage,
    invalid,
    disabled,
    label,
    field: { onBlur, onChange, ref, value },
    required,
    testId,
  } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  // Create converter to preserve number types for option values
  const { convertToOriginalType } = createOptionValueConverter(options);

  // classNames from slots
  const variants = radioBoxesVariants();
  const classNames = variantsToClassNames(variants, className, 'base');
  const boxClassNames: RadioBoxProps['classNames'] = {
    base: classNames.boxBase,
    control: classNames.boxControl,
    description: classNames.boxDescription,
    label: classNames.boxLabel,
    labelWrapper: classNames.boxLabelWrapper,
  };

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
      orientation={inline ? 'horizontal' : 'vertical'}
      value={value != null ? String(value) : ''}
      onValueChange={(newValue) => {
        onChange(convertToOriginalType(newValue));
      }}
    >
      {options.map((option) => {
        if ('value' in option) {
          const optionTestId = slugify(
            `${testId}_option_${option.testId ?? option.value}`,
            { replaceDots: true },
          );
          return (
            <RadioBox
              key={String(option.value)}
              classNames={boxClassNames}
              data-testid={optionTestId}
              description={option.description}
              icon={option.icon}
              isDisabled={!!disabled || option.disabled}
              isInvalid={invalid}
              value={String(option.value)}
            >
              {option.label ?? option.value}
            </RadioBox>
          );
        }
        return null;
      })}
    </HeroRadioGroup>
  );
};

export default RadioBoxes;
