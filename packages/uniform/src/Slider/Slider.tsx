import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';

import { useMemo } from 'react';
import {
  Slider as AriaSlider,
  Label,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from 'react-aria-components';
import { useHover } from 'react-aria/useHover';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { isValueEmpty } from '../helpers';
import useUniformField from '../hooks/useUniformField/useUniformField';
import FieldDescription from '../partials/FieldDescription/FieldDescription';
import FieldLabel from '../partials/FieldLabel/FieldLabel';

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
    // Field-level invalid styling is supplied by the owning group.
    label:
      'cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger',
    labelWrapper: 'mb-1',
    mark: '',
    startContent: '',
    step: '',
    // Mouse submission can focus an invalid thumb without keyboard focus-visible.
    thumb: [
      'group-data-[invalid=true]:data-[focused=true]:outline-2',
      'group-data-[invalid=true]:data-[focused=true]:outline-focus',
      'group-data-[invalid=true]:data-[focused=true]:outline-offset-2',
    ],
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
  /** Optional help text associated with the editable range input. */
  description?: ReactNode;
  /** The offset from where the fill should start */
  fillOffset?: number;
  /** form field label */
  label?: string;
  /** form field name */
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

const sliderStateVariants = tv({
  extend: sliderVariants,
  slots: {
    visualBase: 'flex w-full flex-col gap-1',
    labelWrapper: 'flex w-full items-center justify-between',
    value: 'text-small',
    helperWrapper: 'relative ml-0 block p-0',
    description: 'text-foreground-500 text-tiny',
    errorMessage: 'm-0 text-danger text-tiny',
    trackWrapper: 'relative flex items-center gap-2',
    track:
      'relative my-1.5 flex h-3 w-full rounded-full border-x-[12px] border-x-transparent bg-default-300/50 data-[fill-end=true]:border-e-primary data-[fill-start=true]:border-s-primary',
    filler: 'absolute h-full bg-primary',
    thumb:
      "outline-solid top-1/2 flex h-6 w-6 cursor-grab items-center justify-center rounded-full border-0 bg-primary shadow-small outline-transparent ring-transparent before:absolute before:h-11 before:w-11 before:rounded-full before:content-[''] after:h-5 after:w-5 after:rounded-full after:bg-background after:shadow-small after:transition-all after:content-[''] data-[focus-visible=true]:z-10 data-[focused=true]:z-10 data-[dragging=true]:cursor-grabbing data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus data-[dragging=true]:after:scale-80 motion-reduce:after:transition-none",
    step: 'absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-default-300/50 data-[in-range=true]:bg-background/50 rtl:translate-x-1/2',
  },
  variants: {
    size: {
      sm: {
        track: 'my-2 h-1 border-x-[10px]',
        thumb: 'h-5 w-5 after:h-4 after:w-4',
        step: 'data-[in-range=false]:bg-default-200 data-[in-range=true]:bg-primary',
      },
      md: {},
      lg: {
        track: 'my-1 h-7 border-x-[14px]',
        thumb: 'h-7 w-7 shadow-none',
        value: 'text-medium',
        step: 'h-2 w-2',
      },
    },
    disabled: {
      true: { visualBase: 'opacity-disabled', thumb: 'cursor-default' },
    },
    invalid: {
      true: {
        filler: 'bg-danger',
        thumb: 'bg-danger',
        track:
          'data-[fill-end=true]:border-e-danger data-[fill-start=true]:border-s-danger',
      },
    },
  },
  compoundVariants: [
    {
      size: 'sm',
      invalid: true,
      class: { step: 'data-[in-range=true]:bg-danger' },
    },
  ],
});

/** Owned slider presentation with one registered range input. */
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
  const field = useUniformField({ name, ...uniformFieldProps });
  const { disabled, invalid, label, required, ids, testId, ref } = field;
  const inputRef = useMemo(() => {
    let current: HTMLInputElement | null = null;
    return {
      get current() {
        return current;
      },
      set current(node: HTMLInputElement | null) {
        current = node;
        ref(node);
      },
    };
  }, [ref]);
  const styling = useStyling();
  const classes = styling.variantsToClassNames(
    styling.resolve(sliderStateVariants, { size, disabled, invalid }),
    className,
    'base',
  );
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });
  const associations = field.getControlProps();
  const describedBy =
    [
      associations['aria-describedby'],
      required ? `${ids.control}-required` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  const rawValue =
    field.field.value != null ? Number(field.field.value) : minValue;
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
  return (
    <div
      className={classes.base}
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      onFocus={(event) => {
        if (event.target === event.currentTarget && !disabled) {
          inputRef.current?.focus();
        }
      }}
      tabIndex={disabled ? undefined : -1}
    >
      {required ? (
        <span className="sr-only" id={`${ids.control}-required`}>
          Required selection.
        </span>
      ) : null}
      <AriaSlider<number>
        {...associations}
        {...hoverProps}
        aria-describedby={describedBy}
        aria-labelledby={undefined}
        aria-required={undefined}
        className={classes.visualBase}
        data-hover={isHovered}
        data-slot="base"
        isDisabled={disabled}
        maxValue={maxValue}
        minValue={minValue}
        name={name}
        onChange={field.onChange}
        onChangeEnd={(next) => {
          if (isValueEmpty(field.getValues(name))) {
            field.onChange(next);
          }
        }}
        step={step}
        value={value}
      >
        {label ? (
          <div className={classes.labelWrapper} data-slot="labelWrapper">
            {label ? (
              <FieldLabel
                as={Label}
                className={classes.label}
                id={ids.label}
                required={required}
              >
                {label}
              </FieldLabel>
            ) : null}
            <SliderOutput className={classes.value} data-slot="value" />
          </div>
        ) : null}
        <div className={classes.trackWrapper} data-slot="track-wrapper">
          {startContent ? (
            <div className={classes.startContent} data-slot="startContent">
              {startContent}
            </div>
          ) : null}
          <SliderTrack
            className={classes.track}
            data-slot="track"
            render={(props, { state }) => {
              const percent = state.getThumbPercent(0);
              const start = Math.min(offsetPercent, percent);
              const end = Math.max(offsetPercent, percent);
              return (
                <div
                  {...props}
                  data-fill-end={
                    fillOffset === undefined ? end - start === 1 : end === 1
                  }
                  data-fill-start={
                    fillOffset === undefined ? end - start > 0 : start === 0
                  }
                  data-thumb-hidden="false"
                  data-vertical="false"
                >
                  {props.children}
                </div>
              );
            }}
          >
            {({ state }) => {
              const percent = state.getThumbPercent(0);
              const start = Math.min(offsetPercent, percent);
              const end = Math.max(offsetPercent, percent);
              return (
                <>
                  <SliderFill
                    className={classes.filler}
                    data-slot="filler"
                    offset={fillOffset}
                  />
                  {Array.from({ length: stepCount }, (_, index) => {
                    const point = state.getValuePercent(
                      minValue + index * step,
                    );
                    return (
                      <span
                        key={index}
                        aria-hidden
                        className={classes.step}
                        data-in-range={point >= start && point <= end}
                        data-slot="step"
                        style={{ insetInlineStart: `${point * 100}%` }}
                      />
                    );
                  })}
                  <SliderThumb
                    className={classes.thumb}
                    data-slot="thumb"
                    inputRef={inputRef}
                    isInvalid={invalid}
                    name={name}
                    onBlur={field.onBlur}
                  />
                </>
              );
            }}
          </SliderTrack>
          {endContent ? (
            <div className={classes.endContent} data-slot="endContent">
              {endContent}
            </div>
          ) : null}
        </div>
      </AriaSlider>
      {field.description || invalid ? (
        <div className={classes.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={classes.description}
            id={ids.description}
          >
            {field.description}
          </FieldDescription>
          {invalid ? (
            <div
              className={classes.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {field.errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Slider;
