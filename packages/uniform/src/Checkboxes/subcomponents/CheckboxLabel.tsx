import type { CheckboxOption } from '../Checkboxes';

interface CheckboxLabelProps extends Pick<
  CheckboxOption,
  'label' | 'labelSubline'
> {
  /** CSS class name */
  className: {
    /** Container for the option text */
    base: string;
    /** Primary option text */
    label: string;
    /** Supporting option text */
    subline: string;
  };
  /** Option ID used by the control's accessible-name associations */
  id: string;
}

/** Checkbox option text with an optional supporting line and accessible-name IDs */
const CheckboxLabel = ({
  className,
  id,
  label,
  labelSubline,
}: CheckboxLabelProps) => {
  return (
    <span className={className.base} data-slot="label" id={`${id}-label`}>
      {labelSubline ? (
        <div className="flex grow flex-col items-start">
          <span className={className.label} id={`${id}-label-text`}>
            {label}
          </span>
          <span className={className.subline} id={`${id}-subline`}>
            {labelSubline}
          </span>
        </div>
      ) : (
        label
      )}
    </span>
  );
};

export default CheckboxLabel;
