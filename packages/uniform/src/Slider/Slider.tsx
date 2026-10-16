import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { ClassName } from './sliderVariants';

import { isValueEmpty } from '../helpers';
import useUniformField from '../hooks/useUniformField/useUniformField';
import SliderControl from './subcomponents/SliderControl';

export { sliderVariants } from './sliderVariants';

export interface SliderProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Disables the field */
  disabled?: boolean;
  /** Content to display at the end of the slider */
  endContent?: ReactNode;
  /** Help text associated with the field */
  description?: ReactNode;
  /** The offset from where the fill should start */
  fillOffset?: number;
  /** Field label */
  label?: string;
  /** Field name */
  name: string;
  /**
   * The maximum value of the slider
   * @default 100
   */
  maxValue?: number;
  /**
   * The minimum value of the slider
   * @default 0
   */
  minValue?: number;
  /**
   * Whether to show step dots on the slider
   * @default false
   */
  showSteps?: boolean;
  /** Control size */
  size?: 'sm' | 'md' | 'lg';
  /** Content to display at the start of the slider */
  startContent?: ReactNode;
  /**
   * The step value of the slider
   * @default 1
   */
  step?: number;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Transform between stored form values and numeric slider values. Range and step use display units. */
  transform?: InputValueTransform<number>;
}

/** Form input field for choosing a numeric value along a track */
const Slider = ({
  className = undefined,
  endContent = undefined,
  fillOffset = undefined,
  maxValue = 100,
  minValue = 0,
  name,
  showSteps = false,
  size = 'md',
  startContent = undefined,
  step = 1,
  ...uniformFieldProps
}: SliderProps) => {
  const {
    field,
    disabled,
    description,
    errorMessage,
    getControlProps,
    getValues,
    ids,
    invalid,
    label,
    ref,
    required,
    testId,
  } = useUniformField({ ...uniformFieldProps, name });

  // commit an untouched empty field when a completed interaction keeps its displayed value
  const handleChangeEnd = (nextValue: number) => {
    if (isValueEmpty(getValues(name))) {
      field.onChange(nextValue);
    }
  };

  return (
    <SliderControl
      className={className}
      controlProps={getControlProps()}
      description={description}
      disabled={disabled}
      endContent={endContent}
      errorMessage={errorMessage}
      fillOffset={fillOffset}
      ids={ids}
      inputRef={ref}
      invalid={invalid}
      label={label}
      maxValue={maxValue}
      minValue={minValue}
      name={name}
      onBlur={field.onBlur}
      onValueChange={field.onChange}
      onValueCommit={handleChangeEnd}
      required={required}
      showSteps={showSteps}
      size={size}
      startContent={startContent}
      step={step}
      testId={testId}
      value={field.value}
    />
  );
};

export default Slider;
