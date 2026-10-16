import type { FocusEvent } from 'react';
import type { FieldPresentationProps } from '../../partials/types';
import type { SliderProps } from '../Slider';

import { useMemo } from 'react';
import {
  Slider as AriaSlider,
  Label,
  SliderOutput,
} from 'react-aria-components';
import { useHover } from 'react-aria/useHover';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { sliderVariants } from '../sliderVariants';
import SliderTrackControl from './SliderTrackControl';

interface SliderControlProps
  extends
    Omit<SliderProps, 'ariaLabel' | 'label' | 'transform' | 'testId'>,
    FieldPresentationProps<unknown, number> {
  /** Field label */
  label?: React.ReactNode;
  /** Ref forwarded to the native range input */
  inputRef: (control: HTMLInputElement | null) => void;
  /** Callback when a drag or keyboard interaction finishes */
  onValueCommit: (value: number) => void;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Slider presentation with label, value output and thumb focus routing
 *
 * @see https://react-aria.adobe.com/Slider
 */
const SliderControl = ({
  className,
  controlProps,
  description,
  disabled,
  endContent,
  errorMessage,
  fillOffset,
  ids,
  inputRef,
  invalid,
  label = undefined,
  maxValue = 100,
  minValue = 0,
  name,
  onBlur,
  onValueChange,
  onValueCommit,
  required,
  showSteps,
  size,
  startContent,
  step = 1,
  testId,
  value: displayValue,
}: SliderControlProps) => {
  const styling = useStyling();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  // forward the thumb ref while keeping it available for wrapper focus
  const controlRef = useMemo(() => {
    let current: HTMLInputElement | null = null;

    return {
      get current() {
        return current;
      },
      set current(node: HTMLInputElement | null) {
        current = node;
        inputRef(node);
      },
    };
  }, [inputRef]);

  const associations = controlProps;
  const describedBy =
    [
      associations['aria-describedby'],
      required ? `${ids.control}-required` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const rawValue = displayValue != null ? Number(displayValue) : minValue;
  const value = Math.min(maxValue, Math.max(minValue, rawValue));

  const stepCount = showSteps
    ? Math.max(0, Math.floor((maxValue - minValue) / (step > 0 ? step : 1)) + 1)
    : 0;

  const offset = fillOffset ?? minValue;
  const offsetPercent =
    maxValue === minValue
      ? 0
      : (Math.min(maxValue, Math.max(minValue, offset)) - minValue) /
        (maxValue - minValue);

  // classNames from slots
  const variants = styling.resolve(sliderVariants, { size, disabled, invalid });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // route wrapper focus to the editable thumb
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !disabled) {
      controlRef.current?.focus();
    }
  };

  return (
    <div
      className={classNames.base}
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      onFocus={handleFocus}
      tabIndex={disabled ? undefined : -1}
    >
      {required ? (
        <span className="sr-only" id={`${ids.control}-required`}>
          Required selection.
        </span>
      ) : null}
      <AriaSlider<number>
        aria-invalid={associations['aria-invalid']}
        aria-label={associations['aria-label']}
        id={associations.id}
        {...hoverProps}
        aria-describedby={describedBy}
        className={classNames.visualBase}
        data-hover={isHovered}
        data-slot="base"
        isDisabled={disabled}
        maxValue={maxValue}
        minValue={minValue}
        onChange={onValueChange}
        onChangeEnd={onValueCommit}
        step={step}
        value={value}
      >
        {label ? (
          <div className={classNames.labelWrapper} data-slot="labelWrapper">
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
            <SliderOutput className={classNames.value} data-slot="value" />
          </div>
        ) : null}
        <div className={classNames.trackWrapper} data-slot="track-wrapper">
          {startContent ? (
            <div className={classNames.startContent} data-slot="startContent">
              {startContent}
            </div>
          ) : null}
          <SliderTrackControl
            className={classNames}
            fillOffset={fillOffset}
            inputRef={controlRef}
            invalid={invalid}
            minValue={minValue}
            name={name}
            offsetPercent={offsetPercent}
            onBlur={onBlur}
            step={step}
            stepCount={stepCount}
          />
          {endContent ? (
            <div className={classNames.endContent} data-slot="endContent">
              {endContent}
            </div>
          ) : null}
        </div>
      </AriaSlider>
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
  );
};

export default SliderControl;
