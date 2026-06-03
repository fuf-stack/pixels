import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { TimeValue } from './timeHelpers';

import { TimeInput as HeroTimeInput } from '@heroui/date-input';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';
import {
  getTimeFieldPlaceholderValue,
  parseTimeValue,
  resolveTimeFieldTimeZone,
  timeValueToString,
} from './timeHelpers';

export const timeVariants = tv({
  slots: {
    /** wrapper around the whole time input */
    base: '',
    /** helper wrapper for error/description */
    helperWrapper: [
      // set padding to 0 for error message exit animation
      'p-0',
    ],
    /** the segmented input element */
    input: '',
    /** inner wrapper around segments and optional content */
    innerWrapper: '',
    /** outer input wrapper */
    inputWrapper: 'bg-content1 focus-within:border-focus',
    /** field label */
    label: '',
    /** individual segment */
    segment: '',
  },
});

type VariantProps = TVProps<typeof timeVariants>;
type ClassName = TVClassName<typeof timeVariants>;

export interface TimeProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** input is disabled */
  disabled?: boolean;
  /** smallest visible unit in the segmented time input */
  granularity?: 'hour' | 'minute';
  /** hide timezone abbreviation for zoned values */
  hideTimeZone?: boolean;
  /** force hour granularity and store UTC hour as number (0-23) */
  hourAsNumber?: boolean;
  /** hour cycle formatting */
  hourCycle?: 12 | 24;
  /** form field label */
  label?: ReactNode;
  /** form field name */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /**
   * Optional timezone used for parsing date-time strings and serializing values.
   * When omitted, local timezone is used.
   */
  timeZone?: string;
  /** value format stored in form state (`string` stores UTC minute values, e.g. `10:15Z`) */
  valueType?: 'string' | 'timeValue';
}

/**
 * Time component based on [HeroUI TimeInput](https://v2.heroui.com/docs/components/time-input)
 */
const Time = ({
  className: _className = undefined,
  granularity = 'minute',
  hideTimeZone = false,
  hourAsNumber = false,
  hourCycle = undefined,
  name,
  timeZone = undefined,
  valueType = 'string',
  ...uniformFieldProps
}: TimeProps) => {
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
  const variants = timeVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');
  const resolvedTimeZone = resolveTimeFieldTimeZone(timeZone);
  const effectiveGranularity = hourAsNumber ? 'hour' : granularity;

  // `hourAsNumber` stores 0-23; convert this into a parseable UTC time for display.
  const normalizedFieldValue =
    hourAsNumber && typeof value === 'number'
      ? `${String(Math.max(0, Math.min(23, value))).padStart(2, '0')}:00Z`
      : value;

  // Normalize incoming form value into HeroUI TimeInput value shape.
  const parsedValue = parseTimeValue(normalizedFieldValue, timeZone);
  const placeholderValue = getTimeFieldPlaceholderValue(timeZone);

  // Normalize TimeInput output into the configured storage format.
  const handleChange = (nextValue: TimeValue) => {
    if (nextValue == null) {
      onChange(null);
      return;
    }

    if (hourAsNumber) {
      const serializedValue = timeValueToString(
        nextValue,
        resolvedTimeZone,
        'hour',
      );

      if (!serializedValue) {
        onChange(null);
        return;
      }

      const [hoursSegment] = serializedValue.split(':');
      const parsedHours = Number(hoursSegment);
      onChange(Number.isNaN(parsedHours) ? null : parsedHours);
      return;
    }

    if (valueType === 'timeValue') {
      onChange(nextValue);
      return;
    }

    onChange(
      timeValueToString(nextValue, resolvedTimeZone, effectiveGranularity) ??
        String(nextValue),
    );
  };

  return (
    <HeroTimeInput
      aria-label={label ? undefined : ariaLabel}
      classNames={{
        base: classNames.base,
        helperWrapper: classNames.helperWrapper,
        innerWrapper: classNames.innerWrapper,
        input: classNames.input,
        inputWrapper: classNames.inputWrapper,
        label: classNames.label,
        segment: classNames.segment,
      }}
      data-testid={testId}
      errorMessage={errorMessage}
      granularity={effectiveGranularity}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      id={testId}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      label={label}
      labelPlacement="outside"
      name={name}
      onBlur={onBlur}
      onChange={handleChange}
      placeholderValue={placeholderValue ?? undefined}
      radius="sm"
      value={parsedValue ?? undefined}
      variant="bordered"
    />
  );
};

export default Time;
