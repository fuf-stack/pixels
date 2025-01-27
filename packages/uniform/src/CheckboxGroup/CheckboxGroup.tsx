import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { Checkbox, CheckboxGroup as HeroCheckboxGroup } from '@heroui/checkbox';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { Controller } from '../Controller';
import { useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const checkboxGroupVariants = tv({
  slots: {
    base: 'group', // Needs group for group-data condition
    errorMessage: 'text-tiny',
    itemBase: '',
    itemIcon: '',
    itemLabel: 'text-sm',
    itemWrapper: '',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger',
    wrapper: '',
  },
});

type VariantProps = TVProps<typeof checkboxGroupVariants>;
type ClassName = TVClassName<typeof checkboxGroupVariants>;

export type CheckboxGroupOption = {
  /** option label */
  label?: React.ReactNode;
  /** option value */
  value: string;
  /** disables the option */
  disabled?: boolean;
  /** HTML data-testid attribute of the option */
  testId?: string;
};

export interface CheckboxGroupProps extends VariantProps {
  /** CSS class name. ClassName: string | { buttons?: string | { base?: string; active?: string }; base?: string;} */
  className?: ClassName;
  /** label displayed above the Checkboxes */
  label?: React.ReactNode;
  /** Name the Field is registered on the form. */
  name: string;
  /** Checkboxes that should be displayed. */
  options: CheckboxGroupOption[];
  /** sets all buttons disabled */
  disabled?: boolean;
  /** id for internal testing. */
  testId?: string;
}

/**
 * CheckboxGroup component based on [HeroUI CheckboxGroup](https://www.heroui.com//docs/components/checkbox-group)
 */
const CheckboxGroup = ({
  className = undefined,
  label = undefined,
  options,
  disabled = false,
  name,
  testId: _testId = undefined,
}: CheckboxGroupProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  const variants = checkboxGroupVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  const itemClassName = {
    base: classNames.itemBase,
    wrapper: classNames.itemWrapper,
    icon: classNames.itemIcon,
    label: classNames.itemLabel,
  };
  const itemGroupClassName = {
    base: classNames.base,
    wrapper: classNames.wrapper,
    label: classNames.label,
  };

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field: { onChange, value = [], ref, onBlur } }) => {
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
          onChange: (newValue: string[]) => onChange(newValue && newValue[0]),
        };

        const multipleCheckboxProps = {
          onChange,
          value: getCheckboxValue(value),
        };

        const checkboxGroupProps =
          options.length === 1 ? singleCheckboxProps : multipleCheckboxProps;

        return (
          <HeroCheckboxGroup
            name={name}
            classNames={itemGroupClassName}
            data-testid={testId}
            // see HeroUI styles for group-data condition (data-invalid),
            // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
            data-invalid={invalid}
            errorMessage={
              error && (
                <FieldValidationError
                  error={error}
                  className={classNames.errorMessage}
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
                  {showTestIdCopyButton && (
                    <FieldCopyTestIdButton testId={testId} />
                  )}
                </label>
              )
            }
            onBlur={onBlur}
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...checkboxGroupProps}
          >
            {options?.map((option) => {
              return (
                <Checkbox
                  data-invalid={invalid}
                  classNames={itemClassName}
                  key={`index_${option.value}`}
                  isDisabled={disabled || option.disabled}
                  value={option?.value}
                  data-testid={slugify(
                    `${testId}_option_${option?.testId || option?.value}`,
                  )}
                >
                  {option?.label}
                </Checkbox>
              );
            })}
          </HeroCheckboxGroup>
        );
      }}
    />
  );
};

export default CheckboxGroup;
