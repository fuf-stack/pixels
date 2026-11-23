import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';

import { useEffect, useRef } from 'react';

import { Slider as HeroUISlider } from '@heroui/slider';
import { VisuallyHidden } from '@react-aria/visually-hidden';

import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';

export const sliderVariants = tv({
  slots: {
    base: [
      // Enables group-data selectors used by slider slots.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
      // Keep spacing between label/track consistent.
      'gap-y-1.5',
    ],
    endContent: '',
    errorMessage: 'ml-1 mt-1',
    filler: '',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger group-data-[required=true]:after:ml-0.5 group-data-[required=true]:after:text-danger group-data-[required=true]:after:content-["*"]',
    labelWrapper: 'mb-1',
    mark: '',
    startContent: '',
    step: '',
    // Validation focuses the input after a mouse submission. HeroUI's keyboard
    // focus-visible state stays false, so expose that focus while invalid too.
    thumb: [
      'group-data-[invalid=true]:data-[focused=true]:outline-2',
      'group-data-[invalid=true]:data-[focused=true]:outline-focus',
      'group-data-[invalid=true]:data-[focused=true]:outline-offset-2',
    ],
    track: '',
    trackWrapper: '',
    value: '',
  },
  variants: {
    readOnly: {
      true: {
        // Inner controls set their own cursors, so override every descendant.
        base: '**:cursor-not-allowed cursor-not-allowed opacity-disabled',
      },
    },
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
  /** form field name */
  name: string;
  /** Prevents changes while keeping the slider focusable and its value in validation and submission */
  readOnly?: boolean;
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
  /** Transform between stored form values and numeric slider values. Range and step use display units. */
  transform?: InputValueTransform<number>;
}

/**
 * Slider component based on [HeroUI Slider](https://www.heroui.com//docs/components/slider)
 */
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
    ariaLabel,
    disabled,
    field,
    getErrorMessageProps,
    getHelperWrapperProps,
    invalid,
    label,
    onBlur,
    onChange,
    readOnly,
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
  const focusSliderInput = () => {
    if (!disabled) {
      visualSliderRef.current
        ?.querySelector<HTMLInputElement>(
          '[data-slot="thumb"] input[type="range"]:not(:disabled)',
        )
        ?.focus();
    }
  };

  // HeroUI renders the thumb's range input internally and offers no prop for
  // it, so mark it read-only directly; screen readers announce this state when
  // keyboard focus reaches the thumb.
  useEffect(() => {
    visualSliderRef.current
      ?.querySelectorAll<HTMLInputElement>(
        '[data-slot="thumb"] input[type="range"]',
      )
      .forEach((input) => {
        if (readOnly) {
          input.setAttribute('aria-readonly', 'true');
        } else {
          input.removeAttribute('aria-readonly');
        }
      });
  }, [readOnly]);

  // classNames from slots
  const variants = sliderVariants({ readOnly });
  const classNames = variantsToClassNames(variants, className, 'base');

  // HeroUI Slider has no read-only mode: it stays focusable and controlled,
  // and changes are ignored so the thumb keeps the stored value.
  const handleChange = (nextValue: number | number[]) => {
    if (!readOnly) {
      onChange(nextValue);
    }
  };

  // Get the current value, defaulting to minValue if null/undefined
  const currentValue = field.value != null ? Number(field.value) : minValue;

  return (
    <div
      className={classNames.base}
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      onFocus={(event) => {
        // Descendant focus events bubble here too; leave those alone.
        if (event.target === event.currentTarget) {
          focusSliderInput();
        }
      }}
      tabIndex={disabled ? undefined : -1}
    >
      {/* Visually hidden input for form accessibility and focus management */}
      <VisuallyHidden>
        <input
          ref={ref}
          aria-label={ariaLabel}
          aria-readonly={readOnly || undefined}
          disabled={disabled}
          max={maxValue}
          min={minValue}
          name={name}
          onBlur={onBlur}
          onChange={(e) => {
            handleChange(Number(e.target.value));
          }}
          // RHF error focus must reach the interactive input as well.
          onFocus={focusSliderInput}
          step={step}
          tabIndex={-1}
          type="range"
          value={currentValue}
        />
      </VisuallyHidden>
      {/* Visual HeroUISlider component */}
      <HeroUISlider
        ref={visualSliderRef}
        aria-label={ariaLabel}
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
        color={invalid ? 'danger' : 'primary'}
        endContent={endContent}
        fillOffset={fillOffset}
        isDisabled={disabled}
        label={label}
        maxValue={maxValue}
        minValue={minValue}
        name={`${name}_slider`}
        onBlur={onBlur}
        onChange={handleChange}
        showSteps={showSteps}
        size={size}
        startContent={startContent}
        step={step}
        value={currentValue}
      />
      {invalid ? (
        <div
          {...getHelperWrapperProps()}
          className={cn(
            getHelperWrapperProps()?.className,
            // force helper to be visible (for some reason it's hidden by default) and remove margin
            'ml-0 block',
          )}
        >
          <div {...getErrorMessageProps()}>{errorMessage}</div>
        </div>
      ) : null}
    </div>
  );
};

export default Slider;
