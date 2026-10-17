import type { ProgressCircularProps } from '../ProgressCircular';
import type { ProgressCircularClassNames } from '../progressCircularVariants';

interface ProgressCircularRingProps extends Pick<
  ProgressCircularProps,
  'size' | 'strokeWidth'
> {
  /** CSS class name */
  className: ProgressCircularClassNames;
  /** Filled percentage within the range from zero to one hundred */
  percentage: number;
}

/** SVG track and progress arc sharing the same radius and stroke width */
const ProgressCircularRing = ({
  className: classNames,
  percentage,
  size = 'md',
  strokeWidth: customStrokeWidth = undefined,
}: ProgressCircularRingProps) => {
  // smaller rings need a proportionally heavier stroke
  let strokeWidth = customStrokeWidth;
  if (!strokeWidth) {
    switch (size) {
      case 'xs':
        strokeWidth = 2;
        break;
      case 'sm':
        strokeWidth = 1.8;
        break;
      default:
        strokeWidth = 1.6;
    }
  }

  const radius = 16 - strokeWidth;
  const circumference = 2 * radius * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      aria-hidden="true"
      className={classNames.svg}
      data-slot="svg"
      fill="none"
      strokeWidth={strokeWidth}
      viewBox="0 0 32 32"
    >
      {/* unfilled track */}
      <circle
        className={classNames.track}
        cx={16}
        cy={16}
        data-slot="track"
        r={radius}
        role="presentation"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(-90 16 16)"
      />

      {/* completed arc */}
      <circle
        className={classNames.indicator}
        cx={16}
        cy={16}
        data-slot="indicator"
        r={radius}
        role="presentation"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 16 16)"
      />
    </svg>
  );
};

export default ProgressCircularRing;
