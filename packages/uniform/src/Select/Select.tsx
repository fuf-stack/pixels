import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { Props } from 'react-select';

import { useState } from 'react';
import ReactSelect, { components } from 'react-select';

import { useSelect } from '@heroui/select';

import { cn, slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useController, useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const selectVariants = tv({
  slots: {
    base: 'group leading-normal',
    clearIndicator:
      'text-foreground-500 hover:bg-default-200 hover:text-foreground-800 rounded-md p-1 hover:cursor-pointer',
    control:
      'border-default-200 bg-content1 transition-background hover:border-default-400 group-data-[invalid=true]:border-danger group-data-[invalid=true]:hover:border-danger rounded-lg border-2 duration-150! motion-reduce:transition-none',
    control_focused: 'border-focus',
    crossIcon: '',
    downChevron: '',
    dropdownIndicator:
      'text-foreground-500 hover:bg-default-200 rounded-md p-1 hover:cursor-pointer hover:text-black',
    group: '',
    groupHeading: 'text-foreground-500 mt-2 mb-1 ml-3 text-sm',
    indicatorsContainer: 'gap-1 p-1',
    indicatorSeparator: 'bg-default-300',
    input: 'py-0.5 pl-1',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-small group-data-[invalid=true]:!text-danger group-data-[required=true]:after:text-danger pointer-events-auto relative bottom-1.5 ml-1 subpixel-antialiased group-data-[required=true]:after:ml-0.5 group-data-[required=true]:after:content-["*"]',
    loadingIndicator: '',
    loadingMessage: 'text-foreground-500 rounded-sm p-2',
    menu: 'border-default-200 bg-content1 mt-2 rounded-xl border p-1 shadow-lg',
    menuList: '',
    // ensure menu has same z-index as modal so it is visible when rendered in modal
    // see: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/modal.ts (see z-50)
    menuPortal: 'z-50!',
    multiValue: 'bg-default-100 items-center gap-1.5 rounded py-0.5 pr-1 pl-2',
    multiValueContainer: '',
    multiValueLabel: 'py-0.5 leading-6',
    multiValueRemove:
      'text-default-500 hover:border-default-300 hover:text-default-800 rounded hover:cursor-pointer',
    noOptionsMessage: 'text-foreground-500 rounded-sm p-2',
    option_focused: 'bg-default-100 active:bg-default-200',
    option_selected: 'bg-default-300',
    option: 'rounded px-3 py-2 hover:cursor-pointer',
    placeholder: 'text-foreground-500 ml-1 py-0.5 pl-1 text-sm',
    selectContainer: '',
    singleValue: 'ml-1! leading-7!',
    valueContainer: 'gap-1 p-1',
  },
});

interface SelectOption {
  /** option label */
  label?: React.ReactNode;
  /** option value */
  value: string;
}

type VariantProps = TVProps<typeof selectVariants>;
type ClassName = TVClassName<typeof selectVariants>;

export interface SelectProps extends VariantProps {
  /** CSS class name */
  className?: ClassName; // string;
  /** Determine if the  */
  clearable?: boolean;
  /** Set the select to disabled state. */
  disabled?: boolean;
  /** Filter Select Options */
  filterOption?:
    | undefined
    | ((option?: SelectOption, inputValue?: string) => boolean);
  /** Format the label of the option */
  renderOptionLabel?: undefined | Props['formatOptionLabel'];
  /** The value of the search input */
  inputValue?: string;
  /** Label that should be associated with the select. */
  label?: React.ReactNode;
  /** Set the select to a loading state. */
  loading?: boolean;
  /** switch between single and multi select mode. */
  multiSelect?: boolean;
  /** The name for the Select component, used by react-hook-form */
  name: string;
  /** Placeholder that is displayed when nothing is selected */
  placeholder?: string;
  /** The options for the Select component */
  options: SelectOption[];
  /** Handle change events on the input */
  onInputChange?: Props['onInputChange'];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

const InputComponent: typeof components.Input = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}`;

  return <components.Input data-testid={testId} {...props} />;
};

const ControlComponent: typeof components.Control = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}_select`;
  return (
    <div data-testid={testId}>
      {}
      <components.Control {...props} />
    </div>
  );
};

const OptionComponent: typeof components.Option = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}_select_option_${slugify(props?.data?.testId ?? props?.data?.value, { replaceDots: true })}`;
  return (
    <div data-testid={testId}>
      {}
      <components.Option {...props} />
    </div>
  );
};

const DropdownIndicatorComponent: typeof components.DropdownIndicator = (
  props,
) => {
  // @ts-expect-error data-testid is not a default prop

  const testId = props?.selectProps['data-testid'] as string;
  return (
    <div data-testid={`${testId}_select_dropdown`}>
      {}
      <components.DropdownIndicator {...props} />
    </div>
  );
};

/** Select component based on [HeroUI Select](https://www.heroui.com//docs/components/select) and [React-Select](https://react-select.com/home) */
const Select = ({
  className = undefined,
  clearable = true,
  disabled = false,
  filterOption = undefined,
  renderOptionLabel = undefined,
  inputValue = undefined,
  label: _label = undefined,
  loading = false,
  multiSelect = false,
  name,
  onInputChange = undefined,
  options,
  placeholder = undefined,
  testId: _testId = undefined,
}: SelectProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const { field } = useController({ control, disabled, name });
  const { onChange, value, ref, onBlur } = field;

  const [isFocused, setIsFocused] = useState(false);

  const variants = selectVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  const {
    getBaseProps,
    getErrorMessageProps,
    getHelperWrapperProps,
    getLabelProps,
    getTriggerProps,
    getValueProps,
    label,
  } = useSelect({
    children: [],
    classNames,
    errorMessage: JSON.stringify(error),
    isDisabled: disabled,
    isInvalid: invalid,
    isLoading: loading,
    isRequired: required,
    label: _label,
    labelPlacement: 'outside',
    placeholder: ' ',
  });

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  return (
    <div
      {...getBaseProps()}
      className={cn(classNames.base)}
      data-testid={`${testId}_wrapper`}
      // see HeroUI styles for group-data condition (data-invalid),
      // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
      data-required={required}
    >
      {showLabel ? (
        <label
          className={classNames.label}
          data-slot="label"
          htmlFor={`react-select-${name}-input`}
          id={getLabelProps().id}
        >
          {label}
          {showTestIdCopyButton ? (
            <FieldCopyTestIdButton testId={testId} />
          ) : null}
        </label>
      ) : null}
      <ReactSelect
        menuShouldBlockScroll
        unstyled
        aria-errormessage=""
        aria-invalid={invalid}
        components={{
          Input: InputComponent,
          Option: OptionComponent,
          DropdownIndicator: DropdownIndicatorComponent,
          Control: ControlComponent,
        }}
        // Does not affect the testId of the select, but is needed to pass it to sub-components
        aria-labelledby={getTriggerProps()['aria-labelledby']?.split(' ')[1]}
        data-testid={testId}
        filterOption={filterOption}
        formatOptionLabel={renderOptionLabel}
        inputValue={inputValue}
        instanceId={name}
        isClearable={clearable}
        isDisabled={disabled}
        isLoading={loading}
        name={name}
        // set menuPosition to fixed so that menu can be rendered
        // inside Card / Modal components, menuShouldBlockScroll
        // prevents container scroll when menu is open
        isMulti={multiSelect}
        menuPosition="fixed"
        onInputChange={onInputChange}
        options={options}
        placeholder={placeholder}
        classNames={{
          control: () =>
            cn(classNames.control, {
              [classNames.control_focused]: isFocused && !invalid,
            }),
          clearIndicator: () => classNames.clearIndicator,
          dropdownIndicator: () => classNames.dropdownIndicator,
          groupHeading: () => classNames.groupHeading,
          indicatorsContainer: () => classNames.indicatorsContainer,
          indicatorSeparator: () => classNames.indicatorSeparator,
          loadingIndicator: () => classNames.loadingIndicator,
          loadingMessage: () => classNames.loadingMessage,
          input: () => classNames.input,
          menu: () => classNames.menu,
          menuList: () => classNames.menuList,
          menuPortal: () => classNames.menuPortal,
          multiValue: () => classNames.multiValue,
          multiValueLabel: () =>
            cn(classNames.multiValueLabel, `${getValueProps().className}`),
          multiValueRemove: () => classNames.multiValueRemove,
          noOptionsMessage: () => classNames.noOptionsMessage,
          option: ({
            isFocused: optionIsFocused,
            isSelected: optionIsSelected,
          }) =>
            cn(classNames.option, {
              [classNames.option_focused]: optionIsFocused,
              [classNames.option_selected]: optionIsSelected,
            }),
          placeholder: () => classNames.placeholder,
          singleValue: () =>
            cn(classNames.singleValue, `${getValueProps().className}`),
          valueContainer: () => classNames.valueContainer,
        }}
        onBlur={(_e) => {
          setIsFocused(false);
          return onBlur();
        }}
        onChange={(option) => {
          if (multiSelect) {
            onChange(
              (option as SelectOption[])?.map((_option) => _option.value),
            );
          } else {
            onChange((option as SelectOption)?.value);
          }
        }}
        onFocus={(_e) => {
          setIsFocused(true);
        }}
        ref={ref}
        // set complete option as value by current field value
        value={options.find((option) => option.value === value)}
      />
      {error ? (
        <div {...getHelperWrapperProps()}>
          {}
          <div {...getErrorMessageProps()}>
            <FieldValidationError error={error} testId={testId} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Select;
