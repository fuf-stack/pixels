import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactElement, ReactNode } from 'react';

import {
  Radio as HeroRadio,
  RadioGroup as HeroRadioGroup,
} from '@heroui/radio';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';

export const radiosVariants = tv({
  slots: {
    // Needs group for group-data condition
    base: 'group gap-0',
    itemBase: '',
    itemControl: 'bg-focus group-data-[invalid=true]:bg-danger',
    itemDescription: '',
    itemLabel: 'text-sm',
    itemLabelWrapper: '',
    itemWrapper:
      'group-data-[invalid=true]:border-danger! [&:not(group-data-[invalid="true"]):not(group-data-[selected="false"])]:border-focus',
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'mb-2 inline-flex text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    wrapper: '',
  },
});

type VariantProps = TVProps<typeof radiosVariants>;
type ClassName = TVClassName<typeof radiosVariants>;

export interface RadioOption {
  /** disables the option */
  disabled?: boolean;
  /** option label */
  label?: React.ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string;
}

export interface RadiosProps extends VariantProps {
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
  className = undefined,
  inline = false,
  name,
  options,
  ...uniformFieldProps
}: RadiosProps): ReactElement => {
  const {
    disabled,
    errorMessage,
    field: { onBlur, onChange, ref },
    invalid,
    label,
    required,
    defaultValue,
    testId,
  } = useUniformField({
    name,
    ...uniformFieldProps,
  });

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

  return (
    <HeroRadioGroup
      ref={ref}
      classNames={classNames}
      // see HeroUI styles for group-data condition (data-invalid),
      // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      defaultValue={defaultValue as string | undefined}
      errorMessage={errorMessage}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      label={label ? <legend>{label}</legend> : null}
      name={name}
      onBlur={onBlur}
      orientation={inline ? 'horizontal' : 'vertical'}
    >
      {options.map((option) => {
        if ('value' in option) {
          const optionTestId = slugify(
            `${testId}_option_${option.testId ?? option.value}`,
            { replaceDots: true },
          );
          return (
            <HeroRadio
              key={option.value}
              classNames={itemClassNames}
              data-testid={optionTestId}
              isDisabled={!!disabled || option.disabled}
              onChange={onChange}
              value={option.value}
            >
              {option.label ?? option.value}
            </HeroRadio>
          );
        }
        return null;
      })}
    </HeroRadioGroup>
  );
};

export default Radios;
