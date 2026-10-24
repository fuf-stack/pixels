interface CheckboxIndicatorProps {
  /** CSS class name */
  className: {
    /** Animated checkmark */
    icon: string;
    /** Selection indicator surface */
    wrapper: string;
  };
  /** Whether the option is selected */
  selected: boolean;
}

/** Checkbox selection indicator with an animated checkmark */
const CheckboxIndicator = ({ className, selected }: CheckboxIndicatorProps) => {
  return (
    <span aria-hidden className={className.wrapper} data-slot="wrapper">
      <svg
        aria-hidden
        className={className.icon}
        data-slot="icon"
        fill="none"
        role="presentation"
        stroke="currentColor"
        strokeDasharray={22}
        strokeDashoffset={selected ? 44 : 66}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 17 18"
      >
        <polyline
          className="transition-[stroke-dashoffset] delay-200 duration-250 ease-linear motion-reduce:transition-none"
          points="1 9 7 14 15 4"
        />
      </svg>
    </span>
  );
};

export default CheckboxIndicator;
