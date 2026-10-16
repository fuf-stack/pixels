import type { ReactNode } from 'react';
import type { Props } from 'react-select';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type { ClassName, VariantProps } from './selectVariants';

import { createOptionValueConverter } from '../helpers';
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

export interface SelectProps extends VariantProps {
  /** Custom accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName; // string;
  /** Help text associated with the field */
  description?: ReactNode;
  /** Determine if the  */
  clearable?: boolean;
  /** Disables the field */
  disabled?: boolean;
  /** Force menu open for debugging or visual testing. */
  debugMenuOpen?: boolean;
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
  /** Placeholder text */
  placeholder?: string;
  /** Handle change events on the input */
  onInputChange?: Props['onInputChange'];
  /** Available options */
  options: SelectOption[];
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
  const {
    field,
    description,
    disabled,
    errorMessage,
    getControlProps,
    ids,
    invalid,
    label,
    ref,
    required,
    testId,
  } = useUniformField({
    ...uniformFieldProps,
    isArrayValue: multiSelect,
    name,
  });

  const { convertToOriginalType } = createOptionValueConverter(options);

  // convert selected options back to their stored value types
  const handleChange = (option: unknown) => {
    if (multiSelect) {
      field.onChange(
        (option as SelectOption[])?.map((_option) => {
          return convertToOriginalType(_option.value);
        }),
      );
    } else {
      const newValue = (option as SelectOption)?.value;
      // Pass null explicitly when clearing (not undefined)
      field.onChange(newValue != null ? convertToOriginalType(newValue) : null);
    }

    const { isTouched: currentIsTouched } = getFieldState(name, testId);
    if (!currentIsTouched) {
      // mark touched after the new value commits, so validation sees the selection
      queueMicrotask(() => {
        field.onBlur();
      });
    }
  };

  return (
    <SelectControl
      className={className}
      clearable={clearable}
      controlProps={getControlProps()}
      debugMenuOpen={debugMenuOpen}
      description={description}
      disabled={disabled}
      errorMessage={errorMessage}
      filterOption={filterOption}
      ids={ids}
      inputRef={ref}
      inputValue={inputValue}
      invalid={invalid}
      label={label}
      loading={loading}
      multiSelect={multiSelect}
      name={name}
      onBlur={field.onBlur}
      onInputChange={onInputChange}
      onValueChange={handleChange}
      options={options}
      placeholder={placeholder}
      renderEmptyOptions={renderEmptyOptions}
      renderOptionLabel={renderOptionLabel}
      required={required}
      selectedOptionFallback={selectedOptionFallback}
      testId={testId}
      value={field.value}
    />
  );
};

export default Select;
