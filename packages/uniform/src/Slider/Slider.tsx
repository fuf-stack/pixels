import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { ClassName } from './sliderVariants';

import useUniformField from '../hooks/useUniformField/useUniformField';
import SliderControl from './subcomponents/SliderControl';

export { sliderVariants } from './sliderVariants';

export interface SliderProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Content to display at the end of the slider */
  endContent?: ReactNode;
  /** The offset from where the fill should start */
  fillOffset?: number;
  /** Field label */
  label?: string;
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
  /** Field name */
  name: string;
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
  const { field, getValues } = useUniformField({
    ...uniformFieldProps,
    name,
  });

  const getCurrentValue = (): unknown => {
    return getValues(name);
  };

  return (
    <SliderControl
      className={className}
      endContent={endContent}
      field={field}
      fillOffset={fillOffset}
      getCurrentValue={getCurrentValue}
      maxValue={maxValue}
      minValue={minValue}
      showSteps={showSteps}
      size={size}
      startContent={startContent}
      step={step}
    />
  );
};

export default Slider;
