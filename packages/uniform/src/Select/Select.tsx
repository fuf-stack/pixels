import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { Props } from 'react-select';

import { useState } from 'react';
import ReactSelect, { components } from 'react-select';

import { useSelect } from '@heroui/select';

import { cn, slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { Controller } from '../Controller';
import { useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const selectVariants = tv({
  slots: {
    base: 'group leading-normal',
    clearIndicator:
      'rounded-md p-1 text-foreground-500 hover:cursor-pointer hover:bg-default-200 hover:text-foreground-800',
    control:
      'rounded-lg border-2 border-default-200 !duration-150 transition-background hover:border-default-400 group-data-[invalid=true]:border-danger group-data-[invalid=true]:hover:border-danger motion-reduce:transition-none',
    control_focused: 'border-focus',
    crossIcon: '',
    downChevron: '',
    dropdownIndicator:
      'rounded-md p-1 text-foreground-500 hover:cursor-pointer hover:bg-default-200 hover:text-black',
    group: '',
    groupHeading: 'mb-1 ml-3 mt-2 text-sm text-foreground-500',
    indicatorsContainer: 'gap-1 p-1',
    indicatorSeparator: 'bg-default-300',
    input: 'py-0.5 pl-1',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'pointer-events-auto relative bottom-1.5 ml-1 text-small subpixel-antialiased group-data-[invalid=true]:!text-danger group-data-[required=true]:after:ml-0.5 group-data-[required=true]:after:text-danger group-data-[required=true]:after:content-["*"]',
    loadingIndicator: '',
    loadingMessage: 'rounded-sm p-2 text-foreground-500',
    menu: 'mt-2 rounded-xl border border-default-200 bg-content1 p-1 shadow-lg',
    menuList: '',
    // ensure menu has same z-index as modal so it is visible when rendered in modal
    // see: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/modal.ts (see z-50)
    menuPortal: '!z-50',
    multiValue: 'items-center gap-1.5 rounded bg-default-100 py-0.5 pl-2 pr-1',
    multiValueContainer: '',
    multiValueLabel: 'py-0.5 leading-6',
    multiValueRemove:
      'rounded text-default-500 hover:cursor-pointer hover:border-default-300 hover:text-default-800',
    noOptionsMessage: 'rounded-sm p-2 text-foreground-500',
    option_focused: 'bg-default-100 active:bg-default-200',
    option_selected: 'bg-default-300',
    option: 'rounded px-3 py-2 hover:cursor-pointer',
    placeholder: 'ml-1 py-0.5 pl-1 text-sm text-foreground-500',
    selectContainer: '',
    singleValue: '!ml-1 !leading-7',
    valueContainer: 'gap-1 p-1',
  },
});

type SelectOption = {
  /** option label */
  label?: React.ReactNode;
  /** option value */
  value: string;
};

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
  // eslint-disable-next-line react/prop-types, react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}`;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <components.Input data-testid={testId} {...props} />;
};

const ControlComponent: typeof components.Control = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/prop-types, react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}_select`;
  return (
    <div data-testid={testId}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <components.Control {...props} />
    </div>
  );
};

const OptionComponent: typeof components.Option = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/prop-types, react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}_select_option_${slugify(props?.data?.testId ?? props?.data?.value)}`;
  return (
    <div data-testid={testId}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <components.Option {...props} />
    </div>
  );
};

const DropdownIndicatorComponent: typeof components.DropdownIndicator = (
  props,
) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/prop-types
  const testId = props?.selectProps['data-testid'] as string;
  return (
    <div data-testid={`${testId}_select_dropdown`}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
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
    <Controller
      control={control}
      disabled={disabled}
      name={name}
      render={({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        field: { onChange, value, ref, onBlur },
      }) => (
        <div
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...getBaseProps()}
          className={cn(classNames.base)}
          data-testid={`${testId}_wrapper`}
          // see HeroUI styles for group-data condition (data-invalid),
          // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
          data-required={required}
        >
          {showLabel && (
            <label
              className={classNames.label}
              data-slot="label"
              htmlFor={`react-select-${name}-input`}
              id={getLabelProps().id}
            >
              {label}
              {showTestIdCopyButton && (
                <FieldCopyTestIdButton testId={testId} />
              )}
            </label>
          )}
          <ReactSelect
            aria-errormessage=""
            aria-labelledby={
              getTriggerProps()['aria-labelledby']?.split(' ')[1]
            }
            aria-invalid={invalid}
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
            components={{
              Input: InputComponent,
              Option: OptionComponent,
              DropdownIndicator: DropdownIndicatorComponent,
              Control: ControlComponent,
            }}
            // Does not affect the testId of the select, but is needed to pass it to sub-components
            data-testid={testId}
            filterOption={filterOption}
            formatOptionLabel={renderOptionLabel}
            inputValue={inputValue}
            instanceId={name}
            isClearable={clearable}
            isDisabled={disabled}
            isLoading={loading}
            isMulti={multiSelect}
            name={name}
            // set menuPosition to fixed so that menu can be rendered
            // inside Card / Modal components, menuShouldBlockScroll
            // prevents container scroll when menu is open
            menuPosition="fixed"
            menuShouldBlockScroll
            options={options}
            placeholder={placeholder}
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
            onInputChange={onInputChange}
            ref={ref}
            // set complete option as value by current field value
            value={options.find((option) => option.value === value)}
            unstyled
          />
          {error && (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...getHelperWrapperProps()}>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <div {...getErrorMessageProps()}>
                <FieldValidationError error={error} />
              </div>
            </div>
          )}
        </div>
      )}
    />
  );
};

export default Select;
