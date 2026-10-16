import type { ReactNode } from 'react';
import type { FieldControlProps, FieldIds } from '../../partials/types';
import type { DatePickerValue } from '../dateHelpers';
import type { DatePickerProps } from '../DatePicker';

import {
  DatePicker as AriaDatePicker,
  Button,
  DateField,
  DateInput,
  DateSegment,
  Group,
  Label,
} from 'react-aria-components';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { datePickerStateVariants } from '../datePickerVariants';
import DatePickerCalendar from './DatePickerCalendar';

interface DatePickerControlProps extends Pick<
  DatePickerProps,
  | 'ariaLabel'
  | 'className'
  | 'description'
  | 'disabled'
  | 'hideTimeZone'
  | 'hourCycle'
  | 'label'
  | 'name'
  | 'testId'
  | 'withTime'
> {
  /** Reset bridge rendered inside the date engine */
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
  /** Latest selectable date and time */
  maxValue: DatePickerValue;
  /** Earliest selectable date and time */
  minValue: DatePickerValue;
  /** Callback when focus leaves the field */
  onBlur: () => void;
  /** Callback with the edited date value */
  onValueChange: (value: DatePickerValue) => void;
  /** Date and zone used when editing an empty field */
  placeholderValue: DatePickerValue;
  /** Marks the field as required */
  required: boolean;
  /** Parsed date value */
  value: DatePickerValue;
}

/**
 * Date input presentation with editable segments, field messages and calendar
 *
 * @see https://react-aria.adobe.com/DatePicker
 */
const DatePickerControl = ({
  children,
  ariaLabel,
  className,
  controlProps,
  description,
  disabled,
  errorMessage,
  hideTimeZone,
  hourCycle,
  ids,
  inputRef,
  invalid,
  label,
  maxValue,
  minValue,
  name,
  onBlur,
  onValueChange,
  placeholderValue,
  required,
  testId,
  value,
  withTime,
}: DatePickerControlProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(datePickerStateVariants, {
    disabled,
    invalid,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // route form focus to the first enabled date segment
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
    <AriaDatePicker
      {...controlProps}
      ref={handleControlRef}
      aria-label={ariaLabel}
      aria-labelledby={undefined}
      aria-required={undefined}
      className={classNames.base}
      data-slot="base"
      granularity={withTime ? 'minute' : 'day'}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      maxValue={maxValue ?? undefined}
      minValue={minValue ?? undefined}
      name={name}
      onBlur={onBlur}
      onChange={onValueChange}
      placeholderValue={placeholderValue ?? undefined}
      shouldCloseOnSelect={!withTime}
      shouldForceLeadingZeros
      validationBehavior="aria"
      value={value ?? null}
    >
      {({ state }) => {
        return (
          <>
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
            <Group
              className={classNames.inputWrapper}
              data-slot="input-wrapper"
              data-testid={testId}
            >
              <div
                className={classNames.innerWrapper}
                data-slot="inner-wrapper"
              >
                <DateField className="flex h-full w-full">
                  {children}
                  <DateInput
                    className={classNames.input}
                    data-slot="input-field"
                  >
                    {(segment) => {
                      return (
                        <DateSegment
                          className={classNames.segment}
                          data-editable={segment.isEditable || undefined}
                          data-slot="segment"
                          segment={segment}
                        />
                      );
                    }}
                  </DateInput>
                </DateField>
                <Button
                  className={classNames.selectorButton}
                  data-slot="selector-button"
                >
                  <svg
                    aria-hidden
                    className={classNames.selectorIcon}
                    data-slot="selector-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.58c-1.44.115-2.384.397-3.078 1.092c-.695.694-.977 1.639-1.093 3.078h19.842c-.116-1.44-.398-2.384-1.093-3.078c-.694-.695-1.639-.977-3.078-1.093V2.5a.75.75 0 0 0-1.5 0v1.513C15.585 4 14.839 4 14 4h-4c-.839 0-1.585 0-2.25.013z"
                      fill="currentColor"
                    />
                    <path
                      clipRule="evenodd"
                      d="M2 12c0-.839 0-1.585.013-2.25h19.974C22 10.415 22 11.161 22 12v2c0 3.771 0 5.657-1.172 6.828C19.657 22 17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172C2 19.657 2 17.771 2 14zm15 2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-4-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6-3a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              {description || invalid ? (
                <div
                  className={classNames.helperWrapper}
                  data-slot="helper-wrapper"
                >
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
            </Group>
            <DatePickerCalendar
              className={classNames}
              hideTimeZone={hideTimeZone}
              hourCycle={hourCycle}
              maxValue={maxValue}
              minValue={minValue}
              placeholderValue={placeholderValue}
              state={state}
              withTime={withTime}
            />
          </>
        );
      }}
    </AriaDatePicker>
  );
};

export default DatePickerControl;
