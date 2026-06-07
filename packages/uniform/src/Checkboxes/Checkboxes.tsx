import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type {
  CheckboxGroupProps as HeroCheckboxGroupProps,
  CheckboxProps as HeroCheckboxProps,
} from '@heroui/checkbox';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';

import {
  Checkbox as HeroCheckbox,
  CheckboxGroup as HeroCheckboxGroup,
} from '@heroui/checkbox';
import { checkbox as heroCheckboxVariants } from '@heroui/theme';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';

export const checkboxesVariants = tv({
  slots: {
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
      // Keep spacing between label/group consistent.
      'gap-y-1.5',
    ],
    errorMessage: 'text-tiny',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'inline-flex cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger',
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
  /** Arbitrary option metadata for custom render logic. */
  meta?: Record<string, unknown>;
  /** option value */
  value: string;
  /** disables the option */
  disabled?: boolean;
  /** HTML data-testid attribute of the option */
  testId?: string;
}

interface ChildRenderOption {
  /** Prebuilt checkbox element so consumers don't need to recreate HeroCheckbox */
  checkbox: ReactNode;
  /** Option data as provided in `options` */
  option: CheckboxOption;
  /** Render-state flags for this option */
  state: {
    /** Whether this option is currently selected */
    checked: boolean;
    /** Whether this option is disabled */
    disabled: boolean;
    /** Whether the checkbox group is invalid */
    invalid: boolean;
  };
}

export interface CheckboxesProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** Optional child render function for custom full-list layout rendering. */
  children?: (options: ChildRenderOption[]) => ReactNode;
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
  children = undefined,
  className = undefined,
  color = 'primary',
  inline = false,
  lineThrough = false,
  name,
  options,
  ...uniformFieldProps
}: CheckboxesProps) => {
  const {
    ariaLabel,
    disabled,
    errorMessage,
    field: { onChange, value: fieldValue, ref, onBlur },
    invalid,
    label,
    required,
    testId,
  } = useUniformField({
    // Checkbox group values are arrays and can produce nested RHF error shapes.
    isArrayValue: true,
    name,
    ...uniformFieldProps,
  });

  // Ensure value is always an array (checkboxes need arrays)
  const value = Array.isArray(fieldValue) ? (fieldValue as string[]) : [];

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

  // Build option descriptors once so default and custom layouts share the same checkbox nodes/state.
  const renderedOptions = options?.map((option) => {
    const optionTestId = slugify(
      `${testId}_option_${option?.testId ?? option?.value}`,
      {
        replaceDots: true,
      },
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

    const optionIsDisabled = !!disabled || !!option.disabled;
    const checkbox = (
      <HeroCheckbox
        key={`index_${option.value}`}
        aria-label={
          typeof option.label === 'string' ? option.label : option.value
        }
        classNames={optionClassNames}
        data-invalid={invalid}
        data-testid={optionTestId}
        isDisabled={optionIsDisabled}
        value={option?.value}
      >
        {labelContent}
      </HeroCheckbox>
    );

    return {
      checkbox,
      option,
      state: {
        checked: value.includes(option.value),
        disabled: optionIsDisabled,
        invalid: !!invalid,
      },
    };
  });

  return (
    <HeroCheckboxGroup
      ref={ref}
      aria-label={ariaLabel}
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
      {/* Child render function can fully control list layout; fallback keeps default rendering. */}
      {children
        ? children(renderedOptions ?? [])
        : renderedOptions?.map(({ checkbox }) => {
            return checkbox;
          })}
    </HeroCheckboxGroup>
  );
};

export default Checkboxes;
