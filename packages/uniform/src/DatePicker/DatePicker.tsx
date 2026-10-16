import type { ReactNode } from 'react';
import type { DatePickerValue } from './dateHelpers';
import type { ClassName, VariantProps } from './datePickerVariants';

import { useContext } from 'react';
import {
  DatePicker as AriaDatePicker,
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateField,
  DateFieldStateContext,
  DateInput,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
  TimeField,
} from 'react-aria-components';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformField from '../hooks/useUniformField/useUniformField';
import { useWatchFormReset } from '../hooks/useWatchFormReset';
import FieldDescription from '../partials/FieldDescription/FieldDescription';
import FieldLabel from '../partials/FieldLabel/FieldLabel';
import {
  dateValueToUtcIsoString,
  getDatePickerPlaceholderValue,
  parseDateValue,
  resolveDatePickerTimeZone,
} from './dateHelpers';
import { datePickerStateVariants } from './datePickerVariants';

export { datePickerVariants } from './datePickerVariants';

export interface DatePickerProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Optional help text associated with editable date segments. */
  description?: ReactNode;
  /** date picker is disabled */
  disabled?: boolean;
  /**
   * Optional hour cycle override.
   *
   * Defaults to a 24-hour cycle.
   */
  hourCycle?: 12 | 24;
  /** hide timezone abbreviation for zoned values */
  hideTimeZone?: boolean;
  /** form field label */
  label?: ReactNode;
  /** latest selectable value as ISO string */
  maxValue?: string;
  /** earliest selectable value as ISO string */
  minValue?: string;
  /** form field name */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /**
   * Optional advanced override for the display/interpretation timezone.
   *
   * When omitted, the picker uses the current user's local timezone while
   * `withTime` is enabled.
   */
  timeZone?: string;
  /**
   * Enables date-time mode.
   *
   * - `false` (default): date-only input (`day` granularity)
   * - `true`: includes time segments (`minute` granularity)
   */
  withTime?: boolean;
  /** value format stored in form state (`string` stores UTC ISO values) */
  valueType?: 'dateValue' | 'string';
}

const ResetEmptyDateSegments = () => {
  const state = useContext(DateFieldStateContext);
  useWatchFormReset({
    onReset: () => {
      if (state?.value == null) {
        state?.setValue(null);
      }
    },
  });
  return null;
};

const Chevron = ({ previous = false }: { previous?: boolean }) => {
  return (
    <svg
      aria-hidden
      className={
        previous ? 'h-4 w-4 rtl:rotate-180' : 'h-4 w-4 rotate-180 rtl:rotate-0'
      }
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10 3.33334L6 8.00001L10 12.6667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

/**
 * Owned segmented date field and calendar using React Aria.
 */
const DatePicker = ({
  className: _className = undefined,
  hourCycle = 24,
  hideTimeZone = false,
  maxValue = undefined,
  minValue = undefined,
  name,
  timeZone = undefined,
  valueType = 'string',
  withTime = false,
  ...uniformFieldProps
}: DatePickerProps) => {
  const {
    ariaLabel,
    disabled,
    description,
    errorMessage,
    getControlProps,
    ids,
    field: { onBlur, onChange, ref, value },
    invalid,
    label,
    required,
    testId,
  } = useUniformField({ name, ...uniformFieldProps });

  // classNames from slots
  const styling = useStyling();
  const variants = styling.resolve(datePickerStateVariants, {
    disabled,
    invalid,
  });
  const classNames = styling.variantsToClassNames(variants, _className, 'base');
  const resolvedTimeZone = resolveDatePickerTimeZone(withTime, timeZone);

  // Normalize incoming form value into DateValue shape so the field can
  // render consistently from UTC strings, local strings, Date instances, or DateValue objects.
  const parsedValue = parseDateValue(
    value,
    withTime ? resolvedTimeZone : timeZone,
  );

  // Build the default placeholder value for time-enabled pickers.
  const placeholderValue = getDatePickerPlaceholderValue(withTime, timeZone);

  // Parse ISO boundary strings into DateValue objects.
  const parsedMinValue = parseDateValue(
    minValue,
    withTime ? resolvedTimeZone : timeZone,
  );
  const parsedMaxValue = parseDateValue(
    maxValue,
    withTime ? resolvedTimeZone : timeZone,
  );

  // Normalize DatePicker output into the configured storage format before writing to form state.
  const handleChange = (nextValue: DatePickerValue) => {
    if (nextValue == null) {
      onChange(null);
      return;
    }

    if (valueType === 'dateValue') {
      onChange(nextValue);
      return;
    }

    // String mode always stores UTC ISO values so form state is timezone-neutral
    // and comparable across users/locales.
    onChange(
      dateValueToUtcIsoString(nextValue, resolvedTimeZone ?? 'UTC') ??
        String(nextValue),
    );
  };

  return (
    <AriaDatePicker
      {...getControlProps()}
      ref={(element) => {
        ref(
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
      }}
      aria-label={
        uniformFieldProps.ariaLabel ?? (label ? undefined : ariaLabel)
      }
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
      maxValue={parsedMaxValue ?? undefined}
      minValue={parsedMinValue ?? undefined}
      name={name}
      onBlur={onBlur}
      onChange={handleChange}
      placeholderValue={placeholderValue ?? undefined}
      shouldCloseOnSelect={!withTime}
      shouldForceLeadingZeros
      validationBehavior="aria"
      value={parsedValue ?? null}
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
                  <ResetEmptyDateSegments />
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
            <Popover
              className={classNames.popoverContent}
              data-slot="popover-content"
              offset={4}
              placement="bottom"
            >
              <Dialog className={classNames.dialog}>
                <Calendar className={classNames.calendar} data-slot="calendar">
                  <div
                    className={classNames.calendarContent}
                    data-slot="calendar-content"
                  >
                    <header
                      className={classNames.calendarHeader}
                      data-slot="header-wrapper"
                    >
                      <Button
                        className={classNames.calendarButton}
                        data-slot="prev-button"
                        slot="previous"
                      >
                        <Chevron previous />
                      </Button>
                      <Heading
                        className={classNames.calendarTitle}
                        data-slot="title"
                      />
                      <Button
                        className={classNames.calendarButton}
                        data-slot="next-button"
                        slot="next"
                      >
                        <Chevron />
                      </Button>
                    </header>
                    <div
                      className={classNames.gridWrapper}
                      data-slot="grid-wrapper"
                    >
                      <CalendarGrid
                        className={classNames.grid}
                        data-slot="grid"
                        weekdayStyle="narrow"
                      >
                        <CalendarGridHeader className={classNames.gridHeader}>
                          {(day) => {
                            return (
                              <CalendarHeaderCell
                                className={classNames.gridHeaderCell}
                              >
                                {day}
                              </CalendarHeaderCell>
                            );
                          }}
                        </CalendarGridHeader>
                        <CalendarGridBody className={classNames.gridBody}>
                          {(date) => {
                            return (
                              <CalendarCell
                                className={classNames.cell}
                                data-slot="cell-button"
                                date={date}
                              />
                            );
                          }}
                        </CalendarGridBody>
                      </CalendarGrid>
                    </div>
                  </div>
                  {withTime ? (
                    <TimeField
                      className={classNames.timeInput}
                      data-slot="time-input"
                      granularity="minute"
                      hideTimeZone={hideTimeZone}
                      hourCycle={hourCycle}
                      maxValue={
                        parsedMaxValue && 'hour' in parsedMaxValue
                          ? parsedMaxValue
                          : undefined
                      }
                      minValue={
                        parsedMinValue && 'hour' in parsedMinValue
                          ? parsedMinValue
                          : undefined
                      }
                      onChange={(next) => {
                        if (next) {
                          state.setTimeValue(next);
                        }
                      }}
                      placeholderValue={
                        placeholderValue && 'hour' in placeholderValue
                          ? placeholderValue
                          : undefined
                      }
                      shouldForceLeadingZeros
                      validationBehavior="aria"
                      value={state.timeValue ?? null}
                    >
                      <Label
                        className={classNames.timeInputLabel}
                        data-slot="time-input-label"
                      >
                        Time
                      </Label>
                      <div className={classNames.timeInputWrapper}>
                        <DateInput className={classNames.input}>
                          {(segment) => {
                            return (
                              <DateSegment
                                className={classNames.segment}
                                data-editable={segment.isEditable || undefined}
                                segment={segment}
                              />
                            );
                          }}
                        </DateInput>
                      </div>
                    </TimeField>
                  ) : null}
                </Calendar>
              </Dialog>
            </Popover>
          </>
        );
      }}
    </AriaDatePicker>
  );
};

export default DatePicker;
