import type { CheckboxesProps } from '@fuf-stack/uniform/Checkboxes';
import type { DatePickerProps } from '@fuf-stack/uniform/DatePicker';
import type { InputProps } from '@fuf-stack/uniform/Input';
import type { FieldValidationErrorProps } from '@fuf-stack/uniform/partials/FieldValidationError';
import type { RadioBoxesProps } from '@fuf-stack/uniform/RadioBoxes';
import type { RadiosProps } from '@fuf-stack/uniform/Radios';
import type { RadioTabsProps } from '@fuf-stack/uniform/RadioTabs';
import type { SelectProps } from '@fuf-stack/uniform/Select';
import type { SliderProps } from '@fuf-stack/uniform/Slider';
import type { SwitchProps } from '@fuf-stack/uniform/Switch';
import type { SwitchBoxProps } from '@fuf-stack/uniform/SwitchBox';
import type { TextAreaProps } from '@fuf-stack/uniform/TextArea';
import type { TimeProps } from '@fuf-stack/uniform/Time';

import { createStyling } from '@fuf-stack/pixel-utils';
import { datePickerVariants } from '@fuf-stack/uniform/DatePicker';
import { useController } from '@fuf-stack/uniform/hooks/useController';
import { useFormContext } from '@fuf-stack/uniform/hooks/useFormContext';

type OptionNode = ReturnType<NonNullable<RadiosProps['children']>>;

export const standaloneValidation: FieldValidationErrorProps = {
  className: 'font-semibold',
  error: [{ type: 'required', message: 'Required' }],
  testId: 'email',
};

export const associatedValidation: FieldValidationErrorProps = {
  error: [{ type: 'required', message: 'Required' }],
  id: 'email-error',
  testId: 'email',
  className: {
    base: 'list-disc',
    item: 'font-semibold',
    message: 'px-0',
    wrapper: 'text-danger',
  },
};

// Exercise the existing input contract against the packed declarations.
export const inputProps: InputProps = {
  name: 'amount',
  type: 'number',
  size: 'sm',
  description: 'Enter an amount',
  clearable: true,
  className: {
    base: ['mt-4'],
    inputWrapper: 'border-danger',
    input: 'text-body text-danger',
    clearButton: 'text-danger',
    innerWrapper: 'gap-2',
    label: 'font-semibold',
    helperWrapper: 'mt-2',
    description: 'text-small',
    errorMessage: 'rounded bg-danger-50 p-2',
    stepper: 'gap-1',
    stepperButton: 'text-primary',
  },
  transform: {
    toDisplayValue: (value) => {
      return String(value ?? '');
    },
    toFormValue: (value) => {
      return Number(value);
    },
  },
  onClear: () => {},
};

export const textAreaProps: TextAreaProps = {
  name: 'editor',
  label: 'Editor',
  description: 'Multiline text',
  debounceDelay: 500,
  className: {
    base: ['mt-4'],
    inputWrapper: 'border-danger',
    input: 'text-body text-danger',
    clearButton: 'unused-existing-slot',
  },
};

export const selectProps: SelectProps = {
  name: 'choice',
  description: 'Choose a number',
  options: [{ label: 'Zero', value: 0 }],
  multiSelect: true,
  selectedOptionFallback: [{ label: 'Two', value: 2 }],
  className: {
    input: 'text-body',
    singleValue: 'text-body text-danger',
    multiValueContainer: 'rounded',
    crossIcon: 'text-danger',
    downChevron: 'text-danger',
  },
};

export const switchProps: SwitchProps = {
  name: 'enabled',
  size: 'lg',
  description: 'Toggle setting',
  className: { label: 'text-body', thumbIcon: 'text-danger' },
  thumbIcon: ({
    width,
    height,
    className,
    isSelected,
    'data-checked': checked,
  }) => {
    const dimensions: string[] = [width, height, className, checked];
    return isSelected ? dimensions.join(' ') : null;
  },
};

export const switchBoxProps: SwitchBoxProps = {
  ...switchProps,
  icon: null,
  className: { errorMessage: 'font-semibold', helperWrapper: 'mt-2' },
};

export default function useEditorField() {
  const { control } = useFormContext<{ editor: string }>();
  const { field } = useController<{ editor: string }>({
    control,
    name: 'editor',
  });
  // @ts-expect-error Field-name inference remains constrained on the supported low-level API.
  useController<{ editor: string }>({ control, name: 'missing' });
  return field;
}

export const radiosProps: RadiosProps = {
  name: 'choice',
  description: 'Pick one.',
  options: [{ value: 0, meta: { example: true } }],
  className: { itemLabel: 'text-option' },
  children: (items): OptionNode => {
    return items.map(({ radio }): OptionNode => {
      return radio;
    });
  },
};
export const radioBoxesProps: RadioBoxesProps = {
  name: 'choice',
  description: 'Pick one.',
  options: [{ value: 0, description: 'Zero' }],
  className: { boxControl: 'bg-danger' },
};
export const radioTabsProps: RadioTabsProps = {
  name: 'choice',
  description: 'Pick one.',
  options: [{ value: false, content: 'No' }],
  variant: 'underlined',
  className: {
    tabContent: 'text-option',
    description: 'text-small',
    errorMessage: 'font-semibold',
    helperWrapper: 'gap-2',
  },
};

export const checkboxesProps: CheckboxesProps = {
  name: 'choices',
  color: 'info',
  lineThrough: true,
  description: 'Choose one.',
  options: [{ value: 'first', labelSubline: 'First option', meta: { id: 1 } }],
  className: { optionLabel: 'text-option', errorMessage: 'text-tiny' },
  children: (items): OptionNode => {
    return items.map(({ checkbox }): OptionNode => {
      return checkbox;
    });
  },
};

export const sliderProps: SliderProps = {
  name: 'amount',
  description: 'Choose an amount.',
  minValue: -10,
  maxValue: 10,
  step: 0.5,
  fillOffset: 0,
  size: 'lg',
  showSteps: true,
  className: {
    label: 'text-field',
    thumb: 'h-8 w-8',
    filler: 'bg-secondary',
    errorMessage: 'text-tiny',
  },
  transform: {
    toDisplayValue: (value) => {
      return Number(value) * 100;
    },
    toFormValue: (value) => {
      return value / 100;
    },
  },
};

export const timeProps: TimeProps = {
  name: 'appointment',
  description: 'Use UTC.',
  timeZone: 'UTC',
  hourAsNumber: true,
  hourCycle: 24,
  className: {
    input: 'text-body',
    segment: 'text-danger',
    helperWrapper: 'p-0',
  },
};

export const datePickerProps: DatePickerProps = {
  name: 'appointment',
  description: 'Choose a date.',
  withTime: true,
  valueType: 'dateValue',
  timeZone: 'UTC',
  minValue: '2026-01-01',
  maxValue: '2026-12-31',
  className: {
    calendar: 'w-72',
    timeInput: 'gap-4',
    selectorIcon: 'text-danger',
  },
};

// date invalid state is supplied by React Aria, only disabled is a recipe variant
export const datePickerSlots = createStyling().resolve(datePickerVariants, {
  disabled: true,
});
