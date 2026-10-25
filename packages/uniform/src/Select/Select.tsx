import type { ReactNode } from 'react';
import type { Props } from 'react-select';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { ClassName } from './selectVariants';

import { useFormContext } from '../hooks/useFormContext';
import useUniformField from '../hooks/useUniformField/useUniformField';
import SelectControl from './subcomponents/SelectControl';

export { selectVariants } from './selectVariants';

export interface SelectOption {
  /** Disables the field */
  disabled?: boolean;
  /**
   * True when option was auto-generated because the value wasn't found in options.
   * Use in renderOptionLabel to render a component that fetches the real label.
   */
  isFallback?: boolean;
  /** Field label */
  label?: ReactNode;
  /** option value */
  value: string | number;
}

export interface SelectProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Determine if the  */
  clearable?: boolean;
  /** Force menu open for debugging or visual testing. */
  debugMenuOpen?: boolean;
  // string;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Disables the field */
  disabled?: boolean;
  /** Filter Select Options */
  filterOption?:
    undefined | ((option?: SelectOption, inputValue?: string) => boolean);
  /** The value of the search input */
  inputValue?: string;
  /** Field label */
  label?: ReactNode;
  /** Set the select to a loading state. */
  loading?: boolean;
  /** switch between single and multi select mode. */
  multiSelect?: boolean;
  /** Field name */
  name: string;
  /** Handle change events on the input */
  onInputChange?: Props['onInputChange'];
  /** Available options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Render custom content when no options match the current search input. */
  renderEmptyOptions?: Props['noOptionsMessage'];
  /** Format the label of the option */
  renderOptionLabel?: undefined | Props['formatOptionLabel'];
  /**
   * Fallback option(s) for async selects when value isn't in current options.
   * Use when the selected value may not be in the options list (e.g., after
   * search results change). Used only if value not found in options.
   * For single select: pass the option object or undefined
   * For multi-select: pass an array of option objects
   */
  selectedOptionFallback?: SelectOption | SelectOption[];
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Allows disentangled display and form values for a field. */
  transform?: InputValueTransform;
}

/** Form selection field with searchable single or multiple options */
const Select = ({
  className = undefined,
  clearable = true,
  debugMenuOpen = false,
  filterOption = undefined,
  inputValue = undefined,
  loading = false,
  multiSelect = false,
  name,
  onInputChange = undefined,
  options,
  placeholder = undefined,
  renderEmptyOptions = undefined,
  renderOptionLabel = undefined,
  selectedOptionFallback = undefined,
  ...uniformFieldProps
}: SelectProps) => {
  const { getFieldState } = useFormContext();
  const { field } = useUniformField({
    ...uniformFieldProps,
    isArrayValue: multiSelect,
    name,
  });

  const getIsTouched = () => {
    return getFieldState(name, field.testId).isTouched;
  };

  return (
    <SelectControl
      className={className}
      clearable={clearable}
      debugMenuOpen={debugMenuOpen}
      field={field}
      filterOption={filterOption}
      getIsTouched={getIsTouched}
      inputValue={inputValue}
      loading={loading}
      multiSelect={multiSelect}
      onInputChange={onInputChange}
      options={options}
      placeholder={placeholder}
      renderEmptyOptions={renderEmptyOptions}
      renderOptionLabel={renderOptionLabel}
      selectedOptionFallback={selectedOptionFallback}
    />
  );
};

export default Select;
