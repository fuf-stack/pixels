import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { TabsProps } from '@fuf-stack/pixels';
import type { ReactElement, ReactNode } from 'react';
import type radioTabsVariants from './radioTabsVariants';

import { useFocusWithin } from 'react-aria/useFocusWithin';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { createOptionValueConverter } from '../helpers';
import useUniformFieldState from '../hooks/useUniformField/useUniformFieldState';
import { FieldHints } from '../partials/FieldLayout/FieldLayout';
import OwnedTabs, { radioTabsStateVariants } from './OwnedTabs';

export { default as radioTabsVariants } from './radioTabsVariants';

type VariantProps = TVProps<typeof radioTabsVariants>;
type ClassName = TVClassName<typeof radioTabsVariants>;

export interface RadioTabOption {
  /** Optional content inside of the tab */
  content?: ReactNode;
  /** disables the option */
  disabled?: boolean;
  /** option label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string | number | boolean;
}

export interface RadioTabsProps extends Omit<VariantProps, 'hasContent'> {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Determines if the Buttons are disabled or not. */
  disabled?: boolean;
  /** Whether tabs should take up full container width */
  fullWidth?: boolean;
  /** Optional help text associated with this selection group. */
  description?: ReactNode;
  /** determines orientation of the Buttons. */
  inline?: boolean;
  /** Label displayed next to the RadioButton. */
  label?: ReactNode;
  /** Name the RadioButtons are registered at in HTML forms (react-hook-form). */
  name: string;
  /** Radio button configuration. */
  options: RadioTabOption[];
  /** Id to grab element in internal tests. */
  testId?: string;
  /** How the RadioTabs should look like. */
  variant?: TabsProps['variant'];
}

/**
 * Owned selection-field composition with React Aria tabs
 */
const RadioTabs = ({
  className = undefined,
  fullWidth = false,
  inline = false,
  name,
  options,
  variant = undefined,
  ...uniformFieldProps
}: RadioTabsProps): ReactElement => {
  const field = useUniformFieldState({ name, ...uniformFieldProps });
  const {
    disabled,
    invalid,
    label,
    required,
    testId,
    ids,
    field: { value },
    onChange,
  } = field;
  const { focusWithinProps } = useFocusWithin({ onBlurWithin: field.onBlur });

  // Create converter to preserve number types for option values
  const { convertToOriginalType } = createOptionValueConverter(options);

  // check if any option has content
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/promise-function-async
  const hasContent = options.some((option) => {
    return option.content;
  });

  // classNames from slots
  const styling = useStyling();
  const classNames = styling.variantsToClassNames(
    styling.resolve(radioTabsStateVariants, {
      fullWidth,
      hasContent,
      isInvalid: invalid,
      appearance: variant ?? 'solid',
    }),
    className,
    'base',
  );
  const associations = field.getControlProps();
  const describedBy =
    [
      associations['aria-describedby'],
      required ? `${ids.control}-required` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      {...associations}
      {...focusWithinProps}
      ref={(node) =>
        field.ref(
          node
            ? {
                focus: () => {
                  const tab =
                    node.querySelector<HTMLElement>(
                      '[role="tab"][aria-selected="true"]:not([disabled]):not([aria-disabled="true"])',
                    ) ??
                    node.querySelector<HTMLElement>(
                      '[role="tab"]:not([disabled]):not([aria-disabled="true"])',
                    );
                  tab?.focus();
                },
              }
            : null,
        )
      }
      aria-required={undefined}
      aria-describedby={describedBy}
      className={classNames.base}
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      role="group"
    >
      {label ? (
        <div className={classNames.label} data-slot="label" id={ids.label}>
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          ) : null}
        </div>
      ) : null}
      {required ? (
        <span className="sr-only" id={`${ids.control}-required`}>
          Required selection.
        </span>
      ) : null}
      <div
        className={styling.cn(
          'flex flex-col flex-wrap gap-2',
          inline ? 'flex-row' : undefined,
          classNames.wrapper,
        )}
        data-slot="wrapper"
      >
        <OwnedTabs
          classes={classNames}
          disabled={disabled}
          label={
            uniformFieldProps.ariaLabel ??
            (typeof uniformFieldProps.label === 'string'
              ? uniformFieldProps.label
              : name)
          }
          onChange={(key) => onChange(convertToOriginalType(key))}
          options={options}
          selectedKey={value != null ? String(value) : ''}
          testId={(optionValue, explicit) =>
            slugify(`${testId}_option_${explicit ?? optionValue}`, {
              replaceDots: true,
            })
          }
          variant={variant}
          describedBy={describedBy}
        />
      </div>
      <FieldHints
        classes={{
          description: 'text-tiny text-foreground-400',
          errorMessage: 'text-tiny text-danger',
        }}
        description={field.description}
        errorMessage={field.errorMessage}
        ids={ids}
        invalid={invalid}
      />
    </div>
  );
};

export default RadioTabs;
