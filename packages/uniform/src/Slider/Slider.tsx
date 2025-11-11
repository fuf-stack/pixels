import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { useRef } from 'react';

import { Slider as HeroUISlider } from '@heroui/slider';
import { VisuallyHidden } from '@react-aria/visually-hidden';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';

export const sliderVariants = tv({
  slots: {
    base: 'group',
    endContent: '',
    errorMessage: 'ml-1 mt-1',
    filler: '',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger group-data-[required=true]:after:ml-0.5 group-data-[required=true]:after:text-danger group-data-[required=true]:after:content-["*"]',
    labelWrapper: '',
    mark: '',
    startContent: '',
    step: '',
    thumb: '',
    track: '',
    trackWrapper: '',
    value: '',
  },
});

type VariantProps = TVProps<typeof sliderVariants>;
type ClassName = TVClassName<typeof sliderVariants>;

export interface SliderProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** input field is disabled */
  disabled?: boolean;
  /** Content to display at the end of the slider */
  endContent?: ReactNode;
  /** The offset from where the fill should start */
  fillOffset?: number;
  /** form field label */
  label?: string;
  /** form field name */
  name: string;
  /**
   * Whether to show step dots on the slider
   * @default false
   */
  showSteps?: boolean;
  /**
   * The size of the slider
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  /** Content to display at the start of the slider */
  startContent?: ReactNode;
  /**
   * The step value of the slider
   * @default 1
   */
  step?: number;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /**
   * The minimum value of the slider
   * @default 0
   */
  minValue?: number;
  /**
   * The maximum value of the slider
   * @default 100
   */
  maxValue?: number;
}

/**
 * Slider component based on [HeroUI Slider](https://www.heroui.com//docs/components/slider)
 */
const Slider = ({
  className = undefined,
  endContent = undefined,
  fillOffset = undefined,
  name,
  showSteps = false,
  size = 'md',
  startContent = undefined,
  step = 1,
  minValue = 0,
  maxValue = 100,
  ...uniformFieldProps
}: SliderProps) => {
  const {
    ariaLabel,
    disabled,
    field,
    getErrorMessageProps,
    getHelperWrapperProps,
    invalid,
    label,
    onBlur,
    onChange,
    ref,
    required,
    errorMessage,
    testId,
  } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  // Ref for the visual slider to forward focus
  const visualSliderRef = useRef<HTMLDivElement>(null);

  // Track if the user has interacted with the slider (keyboard, mouse, or drag)
  // This prevents marking the field as touched from internal focus management during initialization
  const hasBeenFocusedRef = useRef(false);

  // classNames from slots
  const variants = sliderVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  // Get the current value, defaulting to minValue if null/undefined
  const currentValue = field.value != null ? Number(field.value) : minValue;

  return (
    <div
      className={classNames.base}
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
    >
      {/* Visually hidden input for form accessibility and focus management */}
      <VisuallyHidden>
        <input
          ref={ref}
          aria-label={ariaLabel}
          disabled={disabled}
          max={maxValue}
          min={minValue}
          name={name}
          step={step}
          tabIndex={-1}
          type="range"
          value={currentValue}
          onBlur={() => {
            // Only mark as touched if the user has actually focused the slider
            if (hasBeenFocusedRef.current) {
              onBlur();
            }
          }}
          onChange={(e) => {
            onChange(Number(e.target.value));
          }}
          onFocus={() => {
            // When user tabs to this hidden input or RHF focuses it (e.g., on validation error),
            // forward focus to the visual slider to show focus ring
            visualSliderRef.current?.focus();
          }}
        />
      </VisuallyHidden>
      {/* Visual HeroUISlider component */}
      <HeroUISlider
        ref={visualSliderRef}
        aria-label={ariaLabel}
        color={invalid ? 'danger' : 'primary'}
        endContent={endContent}
        fillOffset={fillOffset}
        isDisabled={disabled}
        label={label}
        maxValue={maxValue}
        minValue={minValue}
        name={`${name}_slider`}
        showSteps={showSteps}
        size={size}
        startContent={startContent}
        step={step}
        value={currentValue}
        classNames={{
          endContent: classNames.endContent,
          filler: classNames.filler,
          label: classNames.label,
          labelWrapper: classNames.labelWrapper,
          mark: classNames.mark,
          startContent: classNames.startContent,
          step: classNames.step,
          thumb: classNames.thumb,
          track: classNames.track,
          trackWrapper: classNames.trackWrapper,
          value: classNames.value,
        }}
        onBlur={() => {
          // Only mark as touched if the user has actually interacted with the slider
          // This prevents premature blur events from internal focus management
          if (hasBeenFocusedRef.current) {
            onBlur();
          }
        }}
        onChange={(value) => {
          // User is interacting with the slider
          hasBeenFocusedRef.current = true;
          onChange(value);
        }}
        onKeyDown={() => {
          // Track that user has interacted with the slider via keyboard
          hasBeenFocusedRef.current = true;
        }}
        onMouseDown={() => {
          // Track that user has interacted with the slider via mouse
          hasBeenFocusedRef.current = true;
        }}
      />
      <div {...getHelperWrapperProps()}>
        <div {...getErrorMessageProps()}>{errorMessage}</div>
      </div>
    </div>
  );
};

export default Slider;
