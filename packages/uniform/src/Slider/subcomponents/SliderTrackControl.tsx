import type { RefObject } from 'react';
import type { SliderProps } from '../Slider';
import type { SliderClassNames } from '../sliderVariants';

import { SliderFill, SliderThumb, SliderTrack } from 'react-aria-components';

interface SliderTrackControlProps extends Pick<
  SliderProps,
  'endContent' | 'fillOffset' | 'name' | 'showSteps' | 'startContent'
> {
  /** CSS class name */
  className: SliderClassNames;
  /** Ref forwarded to the native range input */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Shows validation failure */
  invalid: boolean;
  /** Largest displayed value */
  maxValue: number;
  /** Smallest displayed value */
  minValue: number;
  /** Callback when the thumb loses focus */
  onBlur: () => void;
  /** Distance between selectable values */
  step: number;
}

/**
 * Slider track with fill, step markers and the editable thumb
 *
 * @see https://react-aria.adobe.com/Slider
 */
const SliderTrackControl = ({
  className: classNames,
  endContent,
  fillOffset,
  inputRef,
  invalid,
  maxValue,
  minValue,
  name,
  onBlur,
  showSteps,
  startContent,
  step,
}: SliderTrackControlProps) => {
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
    <div className={classNames.trackWrapper} data-slot="track-wrapper">
      {startContent ? (
        <div className={classNames.startContent} data-slot="startContent">
          {startContent}
        </div>
      ) : null}
      <SliderTrack
        className={classNames.track}
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
                className={classNames.filler}
                data-slot="filler"
                offset={fillOffset}
              />
              {Array.from({ length: stepCount }, (_, index) => {
                const point = state.getValuePercent(minValue + index * step);

                return (
                  <span
                    key={index}
                    aria-hidden
                    className={classNames.step}
                    data-in-range={point >= start && point <= end}
                    data-slot="step"
                    style={{ insetInlineStart: `${point * 100}%` }}
                  />
                );
              })}
              <SliderThumb
                className={classNames.thumb}
                data-slot="thumb"
                inputRef={inputRef}
                isInvalid={invalid}
                name={name}
                onBlur={onBlur}
              />
            </>
          );
        }}
      </SliderTrack>
      {endContent ? (
        <div className={classNames.endContent} data-slot="endContent">
          {endContent}
        </div>
      ) : null}
    </div>
  );
};

export default SliderTrackControl;
