import type { ReactNode } from 'react';
import type { UniformField } from '../../hooks/useUniformField/types';
import type { TimeProps } from '../Time';
import type { TimeValue } from '../timeHelpers';

import {
  DateInput,
  DateSegment,
  Label,
  TimeField,
} from 'react-aria-components';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { getTimeFieldPlaceholderValue, parseTimeValue } from '../timeHelpers';
import { timeVariants } from '../timeVariants';

interface TimeControlProps extends Pick<
  TimeProps,
  | 'className'
  | 'granularity'
  | 'hideTimeZone'
  | 'hourAsNumber'
  | 'hourCycle'
  | 'timeZone'
> {
  /** Reset bridge rendered inside the time engine */
  children: ReactNode;
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, TimeValue>;
}

/**
 * Segmented time presentation with label, messages and editable-segment focus
 *
 * @see https://react-aria.adobe.com/TimeField
 */
const TimeControl = ({
  field,
  children,
  className,
  granularity,
  hideTimeZone,
  hourAsNumber,
  hourCycle,
  timeZone,
}: TimeControlProps) => {
  const styling = useStyling();

  const {
    description,
    disabled,
    errorMessage,
    ids,
    ref: inputRef,
    invalid,
    label,
    name,
    onBlur,
    onChange: onValueChange,
    required,
    testId,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const effectiveGranularity = hourAsNumber ? 'hour' : granularity;

  // numeric hours represent UTC, including midnight as zero
  const normalizedValue =
    hourAsNumber && typeof field.value === 'number'
      ? `${String(Math.max(0, Math.min(23, field.value))).padStart(2, '0')}:00Z`
      : field.value;
  const value = parseTimeValue(normalizedValue, timeZone);

  const placeholderValue = getTimeFieldPlaceholderValue(timeZone);

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
      granularity={effectiveGranularity}
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
