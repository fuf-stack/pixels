import type { useStyling } from '@fuf-stack/pixels/StylingProvider';
import type { SelectClassNames } from '../selectVariants';

/** Maps resolved Uniform slots to React Select's class callbacks */
const getSelectClassNames = (
  classNames: SelectClassNames,
  cn: ReturnType<typeof useStyling>['cn'],
  isFocused: boolean,
  invalid: boolean,
) => {
  // React-select classNames configuration
  return {
    container: () => {
      return classNames.selectContainer;
    },
    group: () => {
      return classNames.group;
    },
    clearIndicator: () => {
      return classNames.clearIndicator;
    },
    control: () => {
      return cn(classNames.control, {
        [classNames.control_focused]: isFocused && !invalid,
      });
    },
    dropdownIndicator: () => {
      return classNames.dropdownIndicator;
    },
    groupHeading: () => {
      return classNames.groupHeading;
    },
    indicatorSeparator: () => {
      return classNames.indicatorSeparator;
    },
    indicatorsContainer: () => {
      return classNames.indicatorsContainer;
    },
    input: () => {
      return classNames.input;
    },
    loadingIndicator: () => {
      return classNames.loadingIndicator;
    },
    loadingMessage: () => {
      return classNames.loadingMessage;
    },
    menu: () => {
      return classNames.menu;
    },
    menuList: () => {
      return classNames.menuList;
    },
    menuPortal: () => {
      return classNames.menuPortal;
    },
    multiValue: () => {
      return classNames.multiValue;
    },
    multiValueLabel: () => {
      return cn(classNames.selectedValue, classNames.multiValueLabel);
    },
    multiValueRemove: () => {
      return classNames.multiValueRemove;
    },
    noOptionsMessage: () => {
      return classNames.noOptionsMessage;
    },
    option: ({
      isDisabled: optionIsDisabled,
      isFocused: optionIsFocused,
      isSelected: optionIsSelected,
    }: {
      isDisabled: boolean;
      isFocused: boolean;
      isSelected: boolean;
    }) => {
      return cn(classNames.option, {
        [classNames.option_disabled]: optionIsDisabled,
        [classNames.option_focused]: optionIsFocused,
        [classNames.option_selected]: optionIsSelected,
      });
    },
    placeholder: () => {
      return classNames.placeholder;
    },
    singleValue: () => {
      return cn(classNames.selectedValue, classNames.singleValue);
    },
    valueContainer: () => {
      return classNames.valueContainer;
    },
  };
};

export default getSelectClassNames;
