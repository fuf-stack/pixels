import type { CheckboxProps } from 'react-aria-components';
import type { CheckboxesProps, CheckboxOption } from '../Checkboxes';
import type { CheckboxClassNames } from '../checkboxesVariants';

import { useId } from 'react';
import { Checkbox } from 'react-aria-components';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { checkboxOptionVariants } from '../checkboxesVariants';

interface CheckboxControlProps {
  /** CSS class name */
  className: CheckboxClassNames;
  /** Color scheme for the selection indicator */
  color: NonNullable<CheckboxesProps['color']>;
  /** Supporting description and error IDs */
  describedBy: string | undefined;
  /** Disables the field */
  disabled: boolean;
  /** Shows validation failure */
  invalid: boolean;
  /** Option label, subline and value */
  option: CheckboxOption;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Checkbox option with an animated indicator, label and optional subline
 *
 * @see https://react-aria.adobe.com/Checkbox
 */
const CheckboxControl = ({
  className: classNames,
  color,
  describedBy,
  disabled,
  invalid,
  option,
  testId,
}: CheckboxControlProps) => {
  const id = useId();
  const styling = useStyling();
  const hasSubline = !!option.labelSubline;
  const hasLabel = !!option.label || hasSubline;
  const labelledBy = hasSubline
    ? `${id}-label-text ${id}-subline`
    : `${id}-label`;
  // classNames from slots
  const variants = styling.resolve(checkboxOptionVariants, { color, invalid });
  const optionClassNames = styling.variantsToClassNames(variants, {
    label: hasSubline ? undefined : classNames.optionLabel,
    wrapper: classNames.optionWrapper,
  });

  // preserve option interaction selectors on the clickable label
  const renderOption: NonNullable<CheckboxProps['render']> = (props, state) => {
    return (
      <label
        {...props}
        data-focus={state.isFocused || undefined}
        data-hover={state.isHovered || undefined}
        data-invalid={invalid}
        htmlFor={id}
      >
        {props.children}
      </label>
    );
  };

  return (
    <Checkbox
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-label={
        typeof option.label === 'string' ? option.label : option.value
      }
      aria-labelledby={hasLabel ? labelledBy : undefined}
      className={classNames.optionBase}
      data-testid={testId}
      id={id}
      isDisabled={disabled}
      isRequired={false}
      render={renderOption}
      validationBehavior="aria"
      value={option.value}
    >
      {({ isSelected }) => {
        return (
          <>
            <span
              aria-hidden
              className={optionClassNames.wrapper}
              data-slot="wrapper"
            >
              <svg
                aria-hidden
                className={classNames.optionIcon}
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
                className={optionClassNames.label}
                data-slot="label"
                id={`${id}-label`}
              >
                {hasSubline ? (
                  <div className="flex grow flex-col items-start">
                    <span
                      className={classNames.optionLabel}
                      id={`${id}-label-text`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={classNames.optionLabelSubline}
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

export default CheckboxControl;
