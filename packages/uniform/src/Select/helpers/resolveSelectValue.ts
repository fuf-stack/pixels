import type { SelectOption } from '../Select';

import { isValueEmpty } from '../../helpers';

/** Finds selected options, preserving fallback labels for asynchronous searches */
const resolveSelectValue = (
  value: unknown,
  options: SelectOption[],
  multiSelect: boolean,
  selectedOptionFallback: SelectOption | SelectOption[] | undefined,
) => {
  // Helper to find option by value
  const findOption = (v: string | number): SelectOption => {
    // First, look in options list
    const inOptions = options.find((option) => {
      return String(option.value) === String(v);
    });
    if (inOptions) {
      return inOptions;
    }

    // Second, look in selectedOptionFallback prop (for async selects)
    if (selectedOptionFallback) {
      if (Array.isArray(selectedOptionFallback)) {
        const inSelected = selectedOptionFallback.find((option) => {
          return String(option.value) === String(v);
        });
        if (inSelected) {
          return inSelected;
        }
      } else if (String(selectedOptionFallback.value) === String(v)) {
        return selectedOptionFallback;
      }
    }

    // Fallback: create option with value as label, marked as fallback
    return { isFallback: true, label: String(v), value: v };
  };

  if (multiSelect) {
    if (!Array.isArray(value) || isValueEmpty(value)) {
      return [];
    }
    return value.map((v) => {
      return findOption(v);
    });
  }

  // Single select - use isValueEmpty to handle marker strings (__NULL__, etc.)
  if (isValueEmpty(value)) {
    return null;
  }
  return findOption(value as string | number);
};

export default resolveSelectValue;
