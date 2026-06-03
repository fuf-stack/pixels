import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { DatePickerProps as HeroDatePickerProps } from '@heroui/date-picker';
import type { ReactNode } from 'react';
import type { DatePickerValue } from './dateHelpers';

import { DatePicker as HeroDatePicker } from '@heroui/date-picker';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';
import {
  dateValueToUtcIsoString,
  getDatePickerPlaceholderValue,
  parseDateValue,
  resolveDatePickerTimeZone,
} from './dateHelpers';

export const datePickerVariants = tv({
  slots: {
    /** wrapper around the whole date picker */
    base: '',
    /** helper wrapper for error/description */
    helperWrapper: [
      // set padding to 0 for error message exit animation
      'p-0',
    ],
    /** the calendar element */
    calendar: '',
    /** the calendar's content element */
    calendarContent: '',
    /**
     * inner wrapper (HeroUI inputWrapper slot)
     *
     * NOTE: Unlike HeroUI Input, the DatePicker does not expose a
     * `data-focus` indicator on the group, so the focus border has to be
     * driven by the native `focus-within` state of the segment inputs.
     */
    inputWrapper: 'bg-content1 focus-within:border-focus',
    /** the calendar popover element */
    popoverContent: '',
    /** selector button element */
    selectorButton: '',
    /** selector icon element */
    selectorIcon: '',
    /** the time-input component element */
    timeInput: '',
    /** the time-input component's label element */
    timeInputLabel: '',
  },
});

type VariantProps = TVProps<typeof datePickerVariants>;
type ClassName = TVClassName<typeof datePickerVariants>;

export interface DatePickerProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** date picker is disabled */
  disabled?: boolean;
  /**
   * Optional hour cycle override.
   *
   * When omitted, the picker uses the user's locale default (12-hour or 24-hour).
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

/**
 * DatePicker component based on [HeroUI DatePicker](https://v2.heroui.com/docs/components/date-picker)
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
    errorMessage,
    field: { onBlur, onChange, value },
    invalid,
    label,
    required,
    testId,
  } = useUniformField({ name, ...uniformFieldProps });

  // classNames from slots
  const variants = datePickerVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');
  const resolvedTimeZone = resolveDatePickerTimeZone(withTime, timeZone);

  // Normalize incoming form value into HeroUI's DateValue shape so the field can
  // render consistently from UTC strings, local strings, Date instances, or DateValue objects.
  const parsedValue = parseDateValue(
    value,
    withTime ? resolvedTimeZone : timeZone,
  );

  // Build the default placeholder value for time-enabled pickers.
  const placeholderValue = getDatePickerPlaceholderValue(withTime, timeZone);

  // Parse ISO boundary strings into HeroUI DateValue objects.
  const parsedMinValue = parseDateValue(
    minValue,
    withTime ? resolvedTimeZone : timeZone,
  ) as unknown as HeroDatePickerProps['minValue'];
  const parsedMaxValue = parseDateValue(
    maxValue,
    withTime ? resolvedTimeZone : timeZone,
  ) as unknown as HeroDatePickerProps['maxValue'];

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
    <HeroDatePicker
      aria-label={label ? undefined : ariaLabel}
      classNames={{
        base: classNames.base,
        calendar: classNames.calendar,
        calendarContent: classNames.calendarContent,
        helperWrapper: classNames.helperWrapper,
        inputWrapper: classNames.inputWrapper,
        popoverContent: classNames.popoverContent,
        selectorButton: classNames.selectorButton,
        selectorIcon: classNames.selectorIcon,
        timeInput: classNames.timeInput,
        timeInputLabel: classNames.timeInputLabel,
      }}
      data-testid={testId}
      errorMessage={errorMessage}
      granularity={withTime ? 'minute' : 'day'}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      id={testId}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      label={label}
      labelPlacement="outside"
      maxValue={parsedMaxValue}
      minValue={parsedMinValue}
      name={name}
      onBlur={onBlur}
      onChange={handleChange}
      placeholderValue={placeholderValue}
      radius="sm"
      value={parsedValue}
      variant="bordered"
    />
  );
};

export default DatePicker;
