import type { UniformField } from '../../hooks/useUniformField/types';
import type { SelectOption as SelectOptionData, SelectProps } from '../Select';

import { useState } from 'react';
import ReactSelect from 'react-select';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { createOptionValueConverter } from '../../helpers';
import {
  getFieldControlProps,
  getFieldDataAttributes,
} from '../../helpers/fieldProps/fieldProps';
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

interface SelectControlProps extends Omit<
  SelectProps,
  keyof UniformField | 'transform'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField;
  /** Reads the current touched state after a selection commits */
  getIsTouched: () => boolean;
}

/**
 * Searchable select presentation with option fallbacks and field layout
 *
 * @see https://react-select.com/components
 */
const SelectControl = ({
  field,
  className,
  clearable,
  debugMenuOpen,
  filterOption,
  getIsTouched,
  inputValue,
  loading,
  multiSelect = false,
  onInputChange,
  options,
  placeholder,
  renderEmptyOptions,
  renderOptionLabel,
  selectedOptionFallback,
}: SelectControlProps) => {
  const {
    description,
    disabled,
    errorMessage,
    ids,
    ref: inputRef,
    invalid,
    label,
    name,
    onBlur,
    onChange: onValueChange,
    required,
    testId,
    value,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const styling = useStyling();
  const [isFocused, setIsFocused] = useState(false);

  const { convertToOriginalType } = createOptionValueConverter(options);

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

  // convert React Select options into the original value types
  const handleChange = (option: unknown) => {
    if (multiSelect) {
      onValueChange(
        (option as SelectOptionData[])?.map((selectedOption) => {
          return convertToOriginalType(selectedOption.value);
        }),
      );
    } else {
      const nextValue = (option as SelectOptionData)?.value;

      // an empty single selection is stored as null
      onValueChange(
        nextValue != null ? convertToOriginalType(nextValue) : null,
      );
    }

    // defer the first touched update so validation reads the committed selection
    if (!getIsTouched()) {
      queueMicrotask(() => {
        onBlur();
      });
    }
  };

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
      {...getFieldDataAttributes(field)}
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
            <ReactSelect<unknown, boolean>
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
              onChange={handleChange}
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
