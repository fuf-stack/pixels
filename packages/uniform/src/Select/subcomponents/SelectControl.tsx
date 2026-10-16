import type { Ref } from 'react';
import type { SelectInstance } from 'react-select';
import type { FieldPresentationProps } from '../../partials/types';
import type { SelectProps } from '../Select';

import { useState } from 'react';
import ReactSelect from 'react-select';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import getFieldDataAttributes from '../../helpers/getFieldDataAttributes/getFieldDataAttributes';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import getSelectClassNames from '../helpers/getSelectClassNames';
import resolveSelectValue from '../helpers/resolveSelectValue';
import { selectVariants } from '../selectVariants';
import SelectClearIndicator from './SelectClearIndicator';
import { SelectControlContext, SelectSlotContext } from './SelectContext';
import SelectDownChevron from './SelectDownChevron';
import SelectDropdownIndicator from './SelectDropdownIndicator';
import SelectInput from './SelectInput';
import SelectInputControl from './SelectInputControl';
import SelectMultiValueContainer from './SelectMultiValueContainer';
import SelectMultiValueRemove from './SelectMultiValueRemove';
import SelectOption from './SelectOption';

const selectComponents = {
  Control: SelectInputControl,
  ClearIndicator: SelectClearIndicator,
  MultiValueRemove: SelectMultiValueRemove,
  DownChevron: SelectDownChevron,
  MultiValueContainer: SelectMultiValueContainer,
  DropdownIndicator: SelectDropdownIndicator,
  Input: SelectInput,
  Option: SelectOption,
};

interface SelectControlProps
  extends
    Omit<SelectProps, 'ariaLabel' | 'transform' | 'testId'>,
    FieldPresentationProps {
  /** Ref forwarded to React Select's editable control */
  inputRef: Ref<SelectInstance>;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Searchable select presentation with option fallbacks and field layout
 *
 * @see https://react-select.com/components
 */
const SelectControl = ({
  className,
  clearable,
  controlProps,
  debugMenuOpen,
  description,
  disabled,
  errorMessage,
  filterOption,
  ids,
  inputRef,
  inputValue,
  invalid,
  label,
  loading,
  multiSelect = false,
  name,
  onBlur,
  onValueChange,
  onInputChange,
  options,
  placeholder,
  renderEmptyOptions,
  renderOptionLabel,
  required,
  selectedOptionFallback,
  testId,
  value,
}: SelectControlProps) => {
  const styling = useStyling();
  const [isFocused, setIsFocused] = useState(false);

  // classNames from slots
  const variants = styling.resolve(selectVariants, { disabled, invalid });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  const reactSelectClassNames = getSelectClassNames(
    classNames,
    styling.cn,
    isFocused,
    invalid,
  );

  // adapt option disabled state for react-select
  const reactSelectOptions = options.map((option) => {
    return {
      ...option,
      isDisabled: option.disabled,
    };
  });

  const reactSelectValue = resolveSelectValue(
    value,
    options,
    multiSelect,
    selectedOptionFallback,
  );

  // update focus state and notify the field on blur
  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  // track focus for the control styles
  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div
      {...getFieldDataAttributes({ disabled, invalid, required })}
      className={classNames.base}
      data-slot="base"
      data-testid={`${testId}_wrapper`}
    >
      <FieldLayout
        className={classNames}
        description={description}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
        label={label}
        required={required}
      >
        <SelectControlContext.Provider value={controlProps}>
          <SelectSlotContext.Provider value={classNames}>
            <ReactSelect
              ref={inputRef}
              aria-errormessage=""
              aria-invalid={invalid}
              aria-label={controlProps['aria-label']}
              aria-labelledby={controlProps['aria-labelledby']}
              classNames={reactSelectClassNames}
              components={selectComponents}
              data-testid={testId}
              filterOption={filterOption}
              formatOptionLabel={renderOptionLabel}
              inputId={ids.control}
              inputValue={inputValue}
              instanceId={ids.control}
              isClearable={clearable}
              isDisabled={disabled}
              isLoading={loading}
              isMulti={multiSelect}
              menuIsOpen={debugMenuOpen ? true : undefined}
              // set menuPosition to fixed so that menu can be rendered
              // inside Card / Modal components, menuShouldBlockScroll
              // prevents container scroll when menu is open
              menuPosition="fixed"
              menuShouldBlockScroll
              name={name}
              noOptionsMessage={renderEmptyOptions}
              onBlur={handleBlur}
              onChange={onValueChange}
              onFocus={handleFocus}
              onInputChange={onInputChange}
              options={reactSelectOptions}
              placeholder={placeholder}
              unstyled
              value={reactSelectValue}
            />
          </SelectSlotContext.Provider>
        </SelectControlContext.Provider>
      </FieldLayout>
    </div>
  );
};

export default SelectControl;
