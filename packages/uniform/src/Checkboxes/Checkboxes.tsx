import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';

import { useId } from 'react';
import { Checkbox, CheckboxGroup, Label } from 'react-aria-components';

import { slugify, tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformField from '../hooks/useUniformField/useUniformField';
import FieldDescription from '../partials/FieldDescription/FieldDescription';
import FieldLabel from '../partials/FieldLabel/FieldLabel';

const colorClasses = {
  default:
    'text-default-foreground after:bg-default after:text-default-foreground',
  primary:
    'text-primary-foreground after:bg-primary after:text-primary-foreground',
  secondary:
    'text-secondary-foreground after:bg-secondary after:text-secondary-foreground',
  success:
    'text-success-foreground after:bg-success after:text-success-foreground',
  warning:
    'text-warning-foreground after:bg-warning after:text-warning-foreground',
  danger: 'text-danger-foreground after:bg-danger after:text-danger-foreground',
  info: 'text-info-foreground after:bg-info after:text-info-foreground',
};

export const checkboxesVariants = tv({
  slots: {
    base: 'group flex w-full flex-col gap-y-1.5',
    errorMessage: 'text-tiny',
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
    color: {
      default: { wrapper: colorClasses.default },
      primary: { wrapper: colorClasses.primary },
      secondary: { wrapper: colorClasses.secondary },
      success: { wrapper: colorClasses.success },
      warning: { wrapper: colorClasses.warning },
      danger: { wrapper: colorClasses.danger },
      info: { wrapper: colorClasses.info },
    },
    lineThrough: {
      true: {
        optionLabel: [
          "inline-flex items-center justify-center before:absolute before:h-0.5 before:w-0 before:bg-foreground before:content-[''] group-data-[selected=true]:opacity-60 group-data-[selected=true]:before:w-full",
          'relative before:transition-all before:duration-200',
        ],
        optionLabelSubline: 'group-data-[selected=true]:opacity-60',
      },
    },
  },
});

const checkboxStateVariants = tv({
  extend: checkboxesVariants,
  slots: {
    base: 'relative',
    label: 'relative',
    wrapper:
      'flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row',
    helperWrapper: 'relative block p-0',
    description: 'text-foreground-400 text-small',
    errorMessage: 'text-danger text-small',
    optionBase:
      'group relative -m-2 inline-flex max-w-fit cursor-pointer select-none items-center justify-start p-2 tap-highlight-transparent data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled',
    optionWrapper: `relative me-2 inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--pixel-radius-medium)*0.6)] transition-transform before:absolute before:inset-0 before:box-border before:rounded-[inherit] before:border-2 before:border-solid before:border-default before:transition-colors before:content-[''] after:absolute after:inset-0 after:origin-center after:scale-50 after:rounded-[inherit] after:opacity-0 after:duration-200 after:ease-linear after:content-[''] after:transition-transform-opacity group-data-[pressed=true]:scale-95 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background group-data-[hover=true]:before:bg-default-100 group-data-[selected=true]:after:scale-100 group-data-[selected=true]:after:opacity-100 motion-reduce:transition-none`,
    optionIcon:
      'pointer-events-none z-10 h-3 w-4 opacity-0 transition-opacity group-data-[selected=true]:opacity-100 motion-reduce:transition-none',
  },
  variants: {
    invalid: {
      true: {
        optionWrapper: 'before:border-danger',
        optionLabel: 'text-danger',
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
  /** Prebuilt checkbox element for custom option layouts */
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
  /** Optional help text associated with the selection group. */
  description?: ReactNode;
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

const CheckboxControl = ({
  option,
  disabled,
  invalid,
  classes,
  color,
  testId,
  describedBy,
}: {
  option: CheckboxOption;
  disabled: boolean;
  invalid: boolean;
  classes: Record<string, string>;
  color: keyof typeof colorClasses;
  testId: string;
  describedBy: string | undefined;
}) => {
  const id = useId();
  const { cn } = useStyling();
  const hasSubline = !!option.labelSubline;
  const hasLabel = !!option.label || hasSubline;
  const labelledBy = hasSubline
    ? `${id}-label-text ${id}-subline`
    : `${id}-label`;
  const labelClasses = cn(
    'relative select-none text-foreground transition-colors-opacity text-medium before:transition-width motion-reduce:transition-none',
    invalid ? 'text-danger' : undefined,
    hasSubline ? undefined : classes.optionLabel,
  );
  return (
    <Checkbox
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-label={
        typeof option.label === 'string' ? option.label : option.value
      }
      aria-labelledby={hasLabel ? labelledBy : undefined}
      className={classes.optionBase}
      data-testid={testId}
      id={id}
      render={(props, state) => (
        <label
          {...props}
          data-invalid={invalid}
          data-focus={state.isFocused || undefined}
          data-hover={state.isHovered || undefined}
          htmlFor={id}
        >
          {props.children}
        </label>
      )}
      validationBehavior="aria"
      value={option.value}
      isDisabled={disabled}
      // The requirement belongs to the selection group, not every option.
      isRequired={false}
    >
      {({ isSelected }) => {
        return (
          <>
            <span
              aria-hidden
              className={cn(colorClasses[color], classes.optionWrapper)}
              data-slot="wrapper"
            >
              <svg
                aria-hidden
                className={classes.optionIcon}
                data-slot="icon"
                fill="none"
                role="presentation"
                stroke="currentColor"
                strokeDasharray={22}
                strokeDashoffset={isSelected ? 44 : 66}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 17 18"
              >
                <polyline
                  className="transition-[stroke-dashoffset] delay-200 duration-250 ease-linear motion-reduce:transition-none"
                  points="1 9 7 14 15 4"
                />
              </svg>
            </span>
            {hasLabel ? (
              <span
                className={labelClasses}
                data-slot="label"
                id={`${id}-label`}
              >
                {hasSubline ? (
                  <div className="flex grow flex-col items-start">
                    <span
                      className={classes.optionLabel}
                      id={`${id}-label-text`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={classes.optionLabelSubline}
                      id={`${id}-subline`}
                    >
                      {option.labelSubline}
                    </span>
                  </div>
                ) : (
                  option.label
                )}
              </span>
            ) : null}
          </>
        );
      }}
    </Checkbox>
  );
};

/** Owned checkbox selection group with React Aria interactions. */
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
  const field = useUniformField({
    name,
    isArrayValue: true,
    ...uniformFieldProps,
  });
  const { disabled, invalid, label, required, testId, ids } = field;
  const value = Array.isArray(field.field.value)
    ? (field.field.value as string[])
    : [];
  const styling = useStyling();
  const classes = styling.variantsToClassNames(
    styling.resolve(checkboxStateVariants, { lineThrough, invalid }),
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
  const renderedOptions = options?.map((option) => {
    const optionDisabled = !!disabled || !!option.disabled;
    return {
      option,
      state: {
        checked: value.includes(option.value),
        disabled: optionDisabled,
        invalid: !!invalid,
      },
      checkbox: (
        <CheckboxControl
          key={`index_${option.value}`}
          classes={classes}
          color={color === 'info' ? 'primary' : color}
          describedBy={describedBy}
          disabled={optionDisabled}
          invalid={invalid}
          option={option}
          testId={slugify(`${testId}_option_${option.testId ?? option.value}`, {
            replaceDots: true,
          })}
        />
      ),
    };
  });
  return (
    <CheckboxGroup
      {...associations}
      ref={(node) => {
        field.ref(
          node
            ? {
                focus: () =>
                  node
                    .querySelector<HTMLInputElement>('input:not(:disabled)')
                    ?.focus(),
              }
            : null,
        );
      }}
      aria-describedby={describedBy}
      aria-labelledby={undefined}
      aria-required={undefined}
      className={classes.base}
      data-slot="base"
      data-testid={testId}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      name={name}
      onBlur={field.onBlur}
      onChange={field.onChange}
      render={(props) => {
        return (
          <div
            {...props}
            aria-invalid={invalid || undefined}
            data-invalid={invalid}
            data-required={required}
          >
            {props.children}
          </div>
        );
      }}
      validationBehavior="aria"
      value={value}
    >
      {label ? (
        <FieldLabel
          as={Label}
          className={classes.label}
          id={ids.label}
          required={required}
        >
          {label}
        </FieldLabel>
      ) : null}
      {required ? (
        <span className="sr-only" id={`${ids.control}-required`}>
          Required selection.
        </span>
      ) : null}
      <div
        className={classes.wrapper}
        data-orientation={inline ? 'horizontal' : 'vertical'}
        data-slot="wrapper"
      >
        {children
          ? children(renderedOptions ?? [])
          : renderedOptions?.map(({ checkbox }) => {
              return checkbox;
            })}
      </div>
      {field.description || invalid ? (
        <div className={classes.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={classes.description}
            id={ids.description}
          >
            {field.description}
          </FieldDescription>
          {invalid ? (
            <div
              className={classes.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {field.errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </CheckboxGroup>
  );
};

export default Checkboxes;
