import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactElement, ReactNode } from 'react';

import { slugify, tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { createOptionValueConverter } from '../helpers';
import useUniformFieldState from '../hooks/useUniformFieldState/useUniformFieldState';
import {
  RadioControl,
  radioControlVariants,
  RadioLayout,
} from '../partials/RadioLayout/RadioLayout';

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
    errorMessage: 'text-danger text-tiny',
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
    wrapper:
      'flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row',
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
  /** Prebuilt radio element for custom option layouts */
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
  /** Optional help text associated with the radio group. */
  description?: ReactNode;
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
 * Radio group with owned presentation and React Aria keyboard interactions
 */
const Radios = ({
  children = undefined,
  className = undefined,
  inline = false,
  name,
  options,
  ...uniformFieldProps
}: RadiosProps): ReactElement => {
  const field = useUniformFieldState({ name, ...uniformFieldProps });
  const {
    disabled,
    invalid,
    testId,
    field: { value },
  } = field;

  // Create converter to preserve number types for option values
  const { convertToOriginalType } = createOptionValueConverter(options);

  // classNames from slots
  const styling = useStyling();
  const classNames = styling.variantsToClassNames(
    styling.resolve(radiosVariants),
    className,
    'base',
  );
  const defaults = styling.resolve(radioControlVariants, { invalid });

  const itemClassNames = {
    base: styling.cn(defaults.base(), classNames.itemBase),
    control: styling.cn(defaults.control(), classNames.itemControl),
    description: styling.cn(defaults.description(), classNames.itemDescription),
    label: styling.cn(defaults.label(), classNames.itemLabel),
    labelWrapper: styling.cn(
      defaults.labelWrapper(),
      classNames.itemLabelWrapper,
    ),
    wrapper: styling.cn(defaults.wrapper(), classNames.itemWrapper),
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
      <RadioControl
        key={optionValue}
        classes={itemClassNames}
        testId={optionTestId}
        disabled={optionIsDisabled}
        invalid={invalid}
        value={optionValue}
      >
        {option.label ?? option.value}
      </RadioControl>
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
    <RadioLayout
      classes={classNames}
      field={field}
      inline={inline}
      onChange={(newValue) => field.onChange(convertToOriginalType(newValue))}
    >
      {/* Child render function can fully control list layout; fallback keeps default rendering. */}
      {children
        ? children(renderedOptions)
        : renderedOptions.map(({ radio }) => {
            return radio;
          })}
    </RadioLayout>
  );
};

export default Radios;
