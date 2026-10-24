import type { FocusEvent } from 'react';
import type { UniformField } from '../../hooks/useUniformField/types';
import type { SliderProps } from '../Slider';

import { useMemo } from 'react';
import {
  Slider as AriaSlider,
  Label,
  SliderOutput,
} from 'react-aria-components';
import { useHover } from 'react-aria/useHover';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { isValueEmpty } from '../../helpers';
import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { sliderVariants } from '../sliderVariants';
import SliderTrackControl from './SliderTrackControl';

interface SliderControlProps extends Omit<
  SliderProps,
  keyof UniformField | 'transform'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, number>;
  /** Reads the stored value at interaction completion */
  getCurrentValue: () => unknown;
}

/**
 * Slider presentation with label, value output and thumb focus routing
 *
 * @see https://react-aria.adobe.com/Slider
 */
const SliderControl = ({
  field,
  className,
  endContent,
  fillOffset,
  maxValue = 100,
  minValue = 0,
  getCurrentValue,
  showSteps,
  size,
  startContent,
  step = 1,
}: SliderControlProps) => {
  const {
    value: displayValue,
    description,
    disabled,
    errorMessage,
    ids,
    ref: inputRef,
    invalid,
    label = undefined,
    name,
    onBlur,
    onChange: onValueChange,
    required,
    testId,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

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

  // classNames from slots
  const variants = styling.resolve(sliderVariants, { size, disabled, invalid });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // an empty field may finish at the displayed minimum without emitting a change
  const handleValueCommit = (nextValue: number) => {
    if (isValueEmpty(getCurrentValue())) {
      onValueChange(nextValue);
    }
  };

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
        onChangeEnd={handleValueCommit}
        step={step}
        value={value}
      >
        {/* label and current value */}
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

        {/* slider track and surrounding content */}
        <SliderTrackControl
          className={classNames}
          endContent={endContent}
          fillOffset={fillOffset}
          inputRef={controlRef}
          invalid={invalid}
          maxValue={maxValue}
          minValue={minValue}
          name={name}
          onBlur={onBlur}
          showSteps={showSteps}
          startContent={startContent}
          step={step}
        />
      </AriaSlider>

      {/* help text and validation messages */}
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
