import type { ComponentProps } from 'react';
import type { DatePickerRenderProps } from 'react-aria-components';
import type { DatePickerValue } from '../dateHelpers';
import type { DatePickerProps } from '../DatePicker';
import type { DatePickerClassNames } from '../datePickerVariants';

import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DateSegment,
  Dialog,
  Heading,
  Label,
  Popover,
  TimeField,
} from 'react-aria-components';

import DatePickerChevron from './DatePickerChevron';

interface DatePickerCalendarProps extends Pick<
  DatePickerProps,
  'hideTimeZone' | 'hourCycle' | 'withTime'
> {
  /** CSS class name */
  className: DatePickerClassNames;
  /** Latest selectable date and time */
  maxValue: DatePickerValue;
  /** Earliest selectable date and time */
  minValue: DatePickerValue;
  /** Date and zone used for an empty time field */
  placeholderValue: DatePickerValue;
  /** Calendar selection and popup state */
  state: DatePickerRenderProps['state'];
}

/**
 * Calendar popup with month navigation and an optional time editor
 *
 * @see https://react-aria.adobe.com/DatePicker
 * @see https://react-aria.adobe.com/Calendar
 */
const DatePickerCalendar = ({
  className: classNames,
  hideTimeZone,
  hourCycle,
  maxValue,
  minValue,
  placeholderValue,
  state,
  withTime,
}: DatePickerCalendarProps) => {
  // keep the calendar's date while editing its time
  const handleTimeChange: NonNullable<
    ComponentProps<typeof TimeField>['onChange']
  > = (next) => {
    if (next) {
      state.setTimeValue(next);
    }
  };

  return (
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
                <DatePickerChevron previous />
              </Button>
              <Heading className={classNames.calendarTitle} data-slot="title" />
              <Button
                className={classNames.calendarButton}
                data-slot="next-button"
                slot="next"
              >
                <DatePickerChevron />
              </Button>
            </header>
            <div className={classNames.gridWrapper} data-slot="grid-wrapper">
              <CalendarGrid
                className={classNames.grid}
                data-slot="grid"
                weekdayStyle="narrow"
              >
                <CalendarGridHeader className={classNames.gridHeader}>
                  {(day) => {
                    return (
                      <CalendarHeaderCell className={classNames.gridHeaderCell}>
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
              maxValue={maxValue && 'hour' in maxValue ? maxValue : undefined}
              minValue={minValue && 'hour' in minValue ? minValue : undefined}
              onChange={handleTimeChange}
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
  );
};

export default DatePickerCalendar;
