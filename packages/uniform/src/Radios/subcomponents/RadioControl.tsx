import type { ReactNode } from 'react';
import type { RadioButtonProps } from 'react-aria-components';
import type { RadioControlClassNames } from './radioControlVariants';

import { useContext, useId } from 'react';
import { RadioButton, RadioField } from 'react-aria-components';

import RadioGroupDescriptionContext from '../../partials/RadioGroupField/RadioGroupDescriptionContext';

interface RadioControlProps {
  /** Option label */
  children: ReactNode;
  /** CSS class name */
  className: RadioControlClassNames;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Decorative option icon */
  icon?: ReactNode;
  /** Marks visible validation failure */
  invalid: boolean;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** String value managed by the containing group */
  value: string;
}

/**
 * React Aria radio option with an indicator, label and optional supporting text
 *
 * Inherits selection and disabled state from its RadioGroup, and supporting
 * message IDs from RadioGroupField when composed inside that engine.
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
const RadioControl = ({
  children,
  className: classNames,
  description = undefined,
  disabled = undefined,
  icon = undefined,
  invalid,
  testId = undefined,
  value,
}: RadioControlProps) => {
  const id = useId();
  const groupDescription = useContext(RadioGroupDescriptionContext);

  const describedBy =
    [groupDescription, description ? `${id}-description` : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const control = (
    <span aria-hidden className={classNames.wrapper} data-slot="wrapper">
      <span className={classNames.control} data-slot="control" />
    </span>
  );

  // preserve option state selectors on the visible label
  const renderOption: NonNullable<RadioButtonProps['render']> = (
    props,
    state,
  ) => {
    return (
      <label
        {...props}
        data-focus={state.isFocused || undefined}
        data-hover={state.isHovered || undefined}
        data-hover-unselected={
          (state.isHovered && !state.isSelected) || undefined
        }
        htmlFor={`${id}-control`}
      >
        {props.children}
      </label>
    );
  };

  return (
    <RadioField
      aria-describedby={describedBy}
      aria-labelledby={`${id}-label`}
      className={classNames.field}
      id={`${id}-control`}
      isDisabled={disabled}
      value={value}
    >
      <RadioButton
        className={classNames.base}
        data-invalid={invalid}
        data-slot="base"
        data-testid={testId}
        render={renderOption}
      >
        {!icon ? control : null}
        {icon ? <div className={classNames.icon}>{icon}</div> : null}
        <div className={classNames.labelWrapper} data-slot="label-wrapper">
          <span
            className={classNames.label}
            data-slot="label"
            id={`${id}-label`}
          >
            {children}
          </span>
          {description ? (
            <div
              className={classNames.description}
              data-slot="description"
              id={`${id}-description`}
            >
              {description}
            </div>
          ) : null}
        </div>
        {icon ? control : null}
      </RadioButton>
    </RadioField>
  );
};

export default RadioControl;
