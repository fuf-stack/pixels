import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

import {
  Checkbox as HeroCheckbox,
  CheckboxGroup as HeroCheckboxGroup,
} from '@heroui/checkbox';
import { checkbox as heroCheckboxVariants } from '@heroui/theme';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useController, useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const checkboxGroupVariants = tv({
  slots: {
    base: 'group', // Needs group for group-data condition
    errorMessage: 'text-tiny',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger',
    optionBase: '',
    optionIcon: '',
    optionLabel: '',
    optionLabelSubline: '!text-small text-foreground-400',
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

type VariantProps = TVProps<typeof checkboxGroupVariants>;
type ClassName = TVClassName<typeof checkboxGroupVariants>;

export type CheckboxGroupOption = {
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
};

export interface CheckboxGroupProps extends VariantProps {
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
  options: CheckboxGroupOption[];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * CheckboxGroup component based on [HeroUI CheckboxGroup](https://www.heroui.com//docs/components/checkbox-group)
 */
const CheckboxGroup = ({
  className = undefined,
  color = 'primary',
  inline = false,
  label = undefined,
  lineThrough = false,
  options,
  disabled = false,
  name,
  testId: _testId = undefined,
}: CheckboxGroupProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const {
    error: _error,
    invalid,
    required,
    testId,
  } = getFieldState(name, _testId);

  const { field } = useController({ control, name, disabled });
  const { onChange, value = [], ref, onBlur } = field;

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  const variants = checkboxGroupVariants({ lineThrough });
  const classNames = variantsToClassNames(variants, className, 'base');

  // map slots to HeroUI class names
  const heroCheckboxGroupClassNames = {
    base: classNames.base,
    label: classNames.label,
    wrapper: classNames.wrapper,
  };
  const heroCheckboxClassNames = {
    base: classNames.optionBase,
    icon: classNames.optionIcon,
    label: classNames.optionLabel,
    wrapper: classNames.optionWrapper,
  };

  // Convert React Hook Form's nested error object structure to a flat array
  // RHF errors can be nested like: checkboxField.0 (individual checkbox errors)
  // and checkboxField._error (global field errors) - this flattens all
  // error values into a single array for rendering with FieldValidationError
  const errorFlat: FieldError[] =
    (_error &&
      Object.values(
        _error as unknown as Record<string, FieldError[]>,
      ).flat()) ||
    [];

  /**
   * Handles the checkbox group value changes based on the number of options:
   * 1. For single checkbox (options.length === 1):
   *    - Converts undefined/empty array to [] for consistent controlled behavior
   *    - Extracts single value from array for onChange
   *
   *    Example: undefined → []
   *            [value] → value
   *
   * 2. For multiple checkboxes:
   *    - Uses raw value array with fallback to empty array
   *    - Passes through onChange directly
   *
   *    Example: undefined → []
   *            ['value1', 'value2'] → ['value1', 'value2']
   */
  const getCheckboxValue = (inputValue: unknown): string[] => {
    if (Array.isArray(inputValue)) {
      return inputValue;
    }
    if (inputValue) {
      return [inputValue as string];
    }
    return [];
  };

  const singleCheckboxProps = {
    value: getCheckboxValue(value),
    onChange: (newValue: string[]) => onChange(newValue?.[0]),
  };

  const multipleCheckboxProps = {
    onChange,
    value: getCheckboxValue(value),
  };

  const checkboxGroupProps =
    options.length === 1 ? singleCheckboxProps : multipleCheckboxProps;

  return (
    <HeroCheckboxGroup
      classNames={heroCheckboxGroupClassNames}
      color={color === 'info' ? 'primary' : color}
      // see HeroUI styles for group-data condition (data-invalid),
      // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
      data-invalid={invalid}
      data-testid={testId}
      errorMessage={
        errorFlat.length > 0 && (
          <FieldValidationError
            className={classNames.errorMessage}
            error={errorFlat}
            testId={testId}
          />
        )
      }
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      label={
        showLabel && (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label>
            {label}
            {showTestIdCopyButton && <FieldCopyTestIdButton testId={testId} />}
          </label>
        )
      }
      name={name}
      onBlur={onBlur}
      orientation={inline ? 'horizontal' : 'vertical'}
      ref={ref}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...checkboxGroupProps}
    >
      {options?.map((option) => {
        const optionTestId = slugify(
          `${testId}_option_${option?.testId || option?.value}`,
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
              <span className={`${classNames.optionLabelSubline}`}>
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
            aria-label={
              typeof option.label === 'string' ? option.label : option.value
            }
            classNames={optionClassNames}
            data-invalid={invalid}
            data-testid={optionTestId}
            isDisabled={disabled || option.disabled}
            key={`index_${option.value}`}
            value={option?.value}
          >
            {labelContent}
          </HeroCheckbox>
        );
      })}
    </HeroCheckboxGroup>
  );
};

export default CheckboxGroup;
