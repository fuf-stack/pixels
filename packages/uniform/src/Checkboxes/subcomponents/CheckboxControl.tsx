import type { CheckboxButtonProps } from 'react-aria-components';
import type { CheckboxesProps, CheckboxOption } from '../Checkboxes';
import type { CheckboxClassNames } from '../checkboxesVariants';

import { useId } from 'react';
import { CheckboxButton, CheckboxField } from 'react-aria-components';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { checkboxOptionVariants } from '../checkboxesVariants';
import CheckboxIndicator from './CheckboxIndicator';
import CheckboxLabel from './CheckboxLabel';

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
  const renderOption: NonNullable<CheckboxButtonProps['render']> = (
    props,
    state,
  ) => {
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
    <CheckboxField
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-label={
        typeof option.label === 'string' ? option.label : option.value
      }
      aria-labelledby={hasLabel ? labelledBy : undefined}
      className={optionClassNames.field}
      id={id}
      isDisabled={disabled}
      isRequired={false}
      validationBehavior="aria"
      value={option.value}
    >
      <CheckboxButton
        className={classNames.optionBase}
        data-testid={testId}
        render={renderOption}
      >
        {({ isSelected }) => {
          return (
            <>
              <CheckboxIndicator
                className={{
                  icon: classNames.optionIcon,
                  wrapper: optionClassNames.wrapper,
                }}
                selected={isSelected}
              />
              {hasLabel ? (
                <CheckboxLabel
                  className={{
                    base: optionClassNames.label,
                    label: classNames.optionLabel,
                    subline: classNames.optionLabelSubline,
                  }}
                  id={id}
                  label={option.label}
                  labelSubline={option.labelSubline}
                />
              ) : null}
            </>
          );
        }}
      </CheckboxButton>
    </CheckboxField>
  );
};

export default CheckboxControl;
