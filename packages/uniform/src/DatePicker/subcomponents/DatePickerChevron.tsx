interface DatePickerChevronProps {
  /** Points toward the previous month */
  previous?: boolean;
}

/** Decorative direction indicator for calendar navigation */
const DatePickerChevron = ({ previous = false }: DatePickerChevronProps) => {
  return (
    <svg
      aria-hidden
      className={
        previous ? 'h-4 w-4 rtl:rotate-180' : 'h-4 w-4 rotate-180 rtl:rotate-0'
      }
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10 3.33334L6 8.00001L10 12.6667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default DatePickerChevron;
