import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { TimeValue } from './timeHelpers';

import { useContext } from 'react';
import {
  DateInput,
  DateSegment,
  Label,
  TimeField,
  TimeFieldStateContext,
} from 'react-aria-components';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformFieldState from '../hooks/useUniformFieldState/useUniformFieldState';
import { useWatchFormReset } from '../hooks/useWatchFormReset';
import { FieldHints } from '../partials/FieldLayout/FieldLayout';
import segmentedFieldSlots from '../partials/SegmentedField/segmentedFieldSlots';
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
    label: 'cursor-default',
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
  /** Optional help text associated with the editable time segments. */
  description?: ReactNode;
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

const timeStateVariants = tv({
  extend: timeVariants,
  slots: segmentedFieldSlots,
  variants: {
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
    invalid: {
      true: {
        label: 'text-danger',
        inputWrapper:
          'border-danger focus-within:border-danger hover:border-danger focus-within:hover:border-danger',
        innerWrapper: 'text-danger',
        segment:
          'text-danger-300 focus:bg-danger-400/50 data-[editable=true]:data-[placeholder=true]:text-danger data-[editable=true]:text-danger data-[editable=true]:focus:text-danger dark:focus:bg-danger-400/20',
      },
    },
  },
});

/** Partial edits do not change the controlled null value, so reset them explicitly. */
const ResetEmptySegments = () => {
  const state = useContext(TimeFieldStateContext);
  useWatchFormReset({
    onReset: () => {
      if (state?.value == null) {
        state?.setValue(null);
      }
    },
  });
  return null;
};

/**
 * Segmented time field with owned presentation and React Aria keyboard behavior.
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
    description,
    errorMessage,
    getControlProps,
    ids,
    field: { onBlur, onChange, ref, value },
    invalid,
    label,
    required,
    testId,
  } = useUniformFieldState({ name, ...uniformFieldProps });

  // classNames from slots
  const styling = useStyling();
  const classNames = styling.variantsToClassNames(
    styling.resolve(timeStateVariants, { disabled, invalid }),
    _className,
    'base',
  );
  const resolvedTimeZone = resolveTimeFieldTimeZone(timeZone);
  const effectiveGranularity = hourAsNumber ? 'hour' : granularity;

  // `hourAsNumber` stores 0-23; convert this into a parseable UTC time for display.
  const normalizedFieldValue =
    hourAsNumber && typeof value === 'number'
      ? `${String(Math.max(0, Math.min(23, value))).padStart(2, '0')}:00Z`
      : value;

  // Normalize incoming form values for the segmented control.
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
    <TimeField
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
      granularity={effectiveGranularity}
      hideTimeZone={hideTimeZone}
      hourCycle={hourCycle}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      name={name}
      onBlur={onBlur}
      onChange={handleChange}
      placeholderValue={placeholderValue ?? undefined}
      shouldForceLeadingZeros
      validationBehavior="aria"
      value={parsedValue ?? null}
    >
      <ResetEmptySegments />
      {label ? (
        <Label className={classNames.label} data-slot="label" id={ids.label}>
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          ) : null}
        </Label>
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
        <FieldHints
          classes={classNames}
          description={description}
          errorMessage={errorMessage}
          ids={ids}
          invalid={invalid}
        />
      </div>
    </TimeField>
  );
};

export default Time;
