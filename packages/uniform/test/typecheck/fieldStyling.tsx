import type { ClassName as CheckboxesClassName } from '../../src/Checkboxes/checkboxesVariants';
import type { ClassName as DatePickerClassName } from '../../src/DatePicker/datePickerVariants';
import type { ClassName as InputClassName } from '../../src/Input/inputVariants';
import type { ClassName as RadioBoxesClassName } from '../../src/RadioBoxes/radioBoxesVariants';
import type { ClassName as RadiosClassName } from '../../src/Radios/radiosVariants';
import type { ClassName as RadioTabsClassName } from '../../src/RadioTabs/radioTabsVariants';
import type { ClassName as SelectClassName } from '../../src/Select/selectVariants';
import type { ClassName as SliderClassName } from '../../src/Slider/sliderVariants';
import type { ClassName as SwitchClassName } from '../../src/Switch/switchVariants';
import type { ClassName as SwitchBoxClassName } from '../../src/SwitchBox/switchBoxVariants';
import type { ClassName as TextAreaClassName } from '../../src/TextArea/textAreaVariants';
import type { ClassName as TimeClassName } from '../../src/Time/timeVariants';

// Shared helper slots must stay in every field's public className type.
// tailwind-variants types follow only one extend level, so a recipe that is
// itself extended references fieldHelperVariants.slots instead.
const helperSlots = {
  description: 'text-small',
  errorMessage: 'font-semibold',
  helperWrapper: 'mt-2',
  label: 'font-semibold',
};

export const checkboxes: CheckboxesClassName = helperSlots;
export const datePicker: DatePickerClassName = helperSlots;
export const input: InputClassName = helperSlots;
export const radioBoxes: RadioBoxesClassName = helperSlots;
export const radios: RadiosClassName = helperSlots;
export const radioTabs: RadioTabsClassName = helperSlots;
export const select: SelectClassName = helperSlots;
export const slider: SliderClassName = helperSlots;
export const textArea: TextAreaClassName = helperSlots;
export const switchBox: SwitchBoxClassName = helperSlots;
export const switchField: SwitchClassName = helperSlots;
export const time: TimeClassName = helperSlots;
