import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type {
  CheckboxGroupProps as HeroCheckboxGroupProps,
  CheckboxProps as HeroCheckboxProps,
} from '@heroui/checkbox';
import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';
import type { InputValueTransform } from '../hooks';

import {
  Checkbox as HeroCheckbox,
  CheckboxGroup as HeroCheckboxGroup,
} from '@heroui/checkbox';
import { checkbox as heroCheckboxVariants } from '@heroui/theme';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks';
import { FieldValidationError } from '../partials/FieldValidationError';

export const checkboxesVariants = tv({
  slots: {
    base: 'group', // Needs group for group-data condition
    errorMessage: 'text-tiny',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'inline-flex text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger',
    optionBase: '',
    optionIcon: '',
    optionLabel: '',
    optionLabelSubline: 'text-foreground-400 !text-small',
    optionWrapper: '',
    wrapper: '',
  },
  variants: {
    // see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/checkbox.ts
    color: {
      info: {
        wrapper:
          'text-info-foreground after:bg-info after:text-info-foreground',
      },
      ...heroCheckboxVariants.variants.color,
    } as const,
    lineThrough: {
      true: {
        optionLabel: [
          ...heroCheckboxVariants.variants.lineThrough.true.label,
          // fix stroke position when used with subline and enable animation
          'relative before:transition-all before:duration-200',
        ],
        optionLabelSubline: 'group-data-[selected=true]:opacity-60',
      },
    },
  },
});

type VariantProps = TVProps<typeof checkboxesVariants>;
type ClassName = TVClassName<typeof checkboxesVariants>;

export interface CheckboxOption {
  /** option label */
  label?: ReactNode;
  /** subline displayed below the label */
  labelSubline?: ReactNode;
  /** option value */
  value: string;
  /** disables the option */
  disabled?: boolean;
  /** HTML data-testid attribute of the option */
  testId?: string;
}

export interface CheckboxesProps extends VariantProps {
  /** CSS class name */
  className?: ClassName;
  /** Color scheme of the checkboxes */
  color?: VariantProps['color'];
  /** Sets all checkboxes disabled */
  disabled?: boolean;
  /** Orientation of the checkboxes */
  inline?: boolean;
  /** Label displayed above the checkboxes */
  label?: ReactNode;
  /** Whether the checkboxes label should be crossed out */
  lineThrough?: boolean;
  /** Name the Field is registered on the form */
  name: string;
  /** Checkboxes that should be displayed. */
  options: CheckboxOption[];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** allows disentangled display and form values for a field */
  transform?: InputValueTransform<string[]>;
}

/**
 * Checkboxes component based on [HeroUI CheckboxGroup](https://www.heroui.com//docs/components/checkbox-group)
 */
const Checkboxes = ({
  className = undefined,
  color = 'primary',
  inline = false,
  lineThrough = false,
  options,
  name,
  ...uniformFieldProps
}: CheckboxesProps) => {
  const {
    disabled,
    error: _error,
    field: { onChange, value: fieldValue, ref, onBlur },
    invalid,
    label,
    required,
    testId,
  } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  // Ensure value is always an array (checkboxes need arrays)
  const value = Array.isArray(fieldValue) ? fieldValue : [];

  // Convert React Hook Form's nested error object structure to a flat array
  // RHF errors can be nested like: checkboxField.0 (individual checkbox errors)
  // and checkboxField._error (global field errors) - this flattens all
  // error values into a single array for rendering with FieldValidationError
  const errorFlat: FieldError[] =
    (_error &&
      Object.values(
        _error as unknown as Record<string, FieldError[]>,
      ).flat()) ??
    [];
  const errorMessage = (
    <FieldValidationError error={errorFlat} testId={testId} />
  );

  // classNames from slots
  const variants = checkboxesVariants({ lineThrough });
  const classNames = variantsToClassNames(variants, className, 'base');

  // map slots to HeroUI class names
  const heroCheckboxGroupClassNames: HeroCheckboxGroupProps['classNames'] = {
    base: classNames.base,
    label: classNames.label,
    wrapper: classNames.wrapper,
  };
  const heroCheckboxClassNames: HeroCheckboxProps['classNames'] = {
    base: classNames.optionBase,
    icon: classNames.optionIcon,
    label: classNames.optionLabel,
    wrapper: classNames.optionWrapper,
  };

  return (
    <HeroCheckboxGroup
      ref={ref}
      classNames={heroCheckboxGroupClassNames}
      color={color === 'info' ? 'primary' : color}
      // see HeroUI styles for group-data condition (data-invalid),
      // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
      data-invalid={invalid}
      data-testid={testId}
      errorMessage={errorMessage}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      label={label ? <legend>{label}</legend> : null}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      orientation={inline ? 'horizontal' : 'vertical'}
      value={value}
    >
      {options?.map((option) => {
        const optionTestId = slugify(
          `${testId}_option_${option?.testId ?? option?.value}`,
          { replaceDots: true },
        );

        // set content and classes depending option has subline
        const hasSubline = !!option.labelSubline;
        let labelContent: ReactNode;
        let optionClassNames = heroCheckboxClassNames;
        if (hasSubline) {
          labelContent = (
            <div className="flex grow flex-col items-start">
              <span className={classNames.optionLabel}>{option.label}</span>
              <span className={classNames.optionLabelSubline}>
                {option.labelSubline}
              </span>
            </div>
          );
          // remove label classes from outer label when subline is used
          optionClassNames = { ...optionClassNames, label: '' };
        } else {
          labelContent = option.label;
        }

        return (
          <HeroCheckbox
            key={`index_${option.value}`}
            classNames={optionClassNames}
            data-invalid={invalid}
            data-testid={optionTestId}
            isDisabled={!!disabled || option.disabled}
            value={option?.value}
            aria-label={
              typeof option.label === 'string' ? option.label : option.value
            }
          >
            {labelContent}
          </HeroCheckbox>
        );
      })}
    </HeroCheckboxGroup>
  );
};

export default Checkboxes;
