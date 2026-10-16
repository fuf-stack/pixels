import type { ReactNode } from 'react';
import type { FieldControlProps, FieldIds } from '../../partials/types';
import type { TimeProps } from '../Time';
import type { TimeValue } from '../timeHelpers';

import {
  DateInput,
  DateSegment,
  Label,
  TimeField,
} from 'react-aria-components';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { timeVariants } from '../timeVariants';

interface TimeControlProps extends Pick<
  TimeProps,
  | 'ariaLabel'
  | 'className'
  | 'description'
  | 'disabled'
  | 'granularity'
  | 'hideTimeZone'
  | 'hourCycle'
  | 'label'
  | 'name'
  | 'testId'
> {
  /** Reset bridge rendered inside the time engine */
  children: ReactNode;
  /** Attributes associating the segments with field messages */
  controlProps: FieldControlProps;
  /** Rendered validation messages */
  errorMessage: ReactNode;
  /** IDs shared with the field label and messages */
  ids: FieldIds;
  /** Connects form focus requests to the first editable segment */
  inputRef: (control: Pick<HTMLElement, 'focus'> | null) => void;
  /** Shows validation failure */
  invalid: boolean;
  /** Callback when focus leaves the field */
  onBlur: () => void;
  /** Callback with the edited segmented value */
  onValueChange: (value: TimeValue) => void;
  /** Date and zone used when editing an empty field */
  placeholderValue: TimeValue;
  /** Marks the field as required */
  required: boolean;
  /** Parsed time value */
  value: TimeValue;
}

/**
 * Segmented time presentation with label, messages and editable-segment focus
 *
 * @see https://react-aria.adobe.com/TimeField
 */
const TimeControl = ({
  children,
  className,
  controlProps,
  description,
  disabled,
  errorMessage,
  granularity,
  hideTimeZone,
  hourCycle,
  ids,
  inputRef,
  invalid,
  label,
  name,
  onBlur,
  onValueChange,
  placeholderValue,
  required,
  testId,
  value,
}: TimeControlProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(timeVariants, { disabled, invalid });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // route form focus to the first enabled segment
  const handleControlRef = (element: HTMLDivElement | null) => {
    inputRef(
      element
        ? {
            focus: () => {
              element
                .querySelector<HTMLElement>(
                  '[role="spinbutton"]:not([aria-disabled="true"])',
                )
                ?.focus();
            },
          }
        : null,
    );
  };

  return (
    <TimeField
      ref={handleControlRef}
      aria-describedby={controlProps['aria-describedby']}
      aria-invalid={controlProps['aria-invalid']}
      aria-label={controlProps['aria-label']}
      className={classNames.base}
      data-slot="base"
      granularity={granularity}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      id={controlProps.id}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      name={name}
      onBlur={onBlur}
      onChange={onValueChange}
      placeholderValue={placeholderValue ?? undefined}
      shouldForceLeadingZeros
      validationBehavior="aria"
      value={value ?? null}
    >
      {children}
      {label ? (
        <FieldLabel
          as={Label}
          className={classNames.label}
          id={ids.label}
          required={required}
        >
          {label}
        </FieldLabel>
      ) : null}
      <div className={classNames.inputWrapper} data-slot="input-wrapper">
        <div className={classNames.innerWrapper} data-slot="inner-wrapper">
          <DateInput
            className={classNames.input}
            data-slot="input"
            data-testid={testId}
          >
            {(segment) => {
              return (
                <DateSegment
                  className={classNames.segment}
                  data-editable={segment.isEditable || undefined}
                  data-slot="segment"
                  data-type={segment.type}
                  segment={segment}
                />
              );
            }}
          </DateInput>
        </div>
        {description || invalid ? (
          <div className={classNames.helperWrapper} data-slot="helper-wrapper">
            <FieldDescription
              className={classNames.description}
              id={ids.description}
            >
              {description}
            </FieldDescription>
            {invalid ? (
              <div
                className={classNames.errorMessage}
                data-slot="error-message"
                id={ids.error}
              >
                {errorMessage}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </TimeField>
  );
};

export default TimeControl;
