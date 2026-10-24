import type { ReactNode } from 'react';
import type { ClassName } from './textAreaVariants';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import useUniformField from '../hooks/useUniformField/useUniformField';
import TextAreaControl from './subcomponents/TextAreaControl';

export { default as textAreaVariants } from './textAreaVariants';

export interface TextAreaProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** Child components. The content of the textarea. */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** debounce delay in milliseconds for form state updates (default: 300ms) */
  debounceDelay?: number;
  /** Help text associated with the editable control. */
  description?: ReactNode;
  /** Determines if the TextArea is disabled or not. */
  disabled?: boolean;
  /** Label displayed above the TextArea. */
  label?: ReactNode;
  /** Name the TextArea is registered at in HTML forms (react-hook-form). */
  name: string;
  /** placeholder for the textArea content. */
  placeholder?: string;
  /** Id to grab element in internal tests. */
  testId?: string;
}

/** Form input field for multiline text */
const TextArea = ({
  className = undefined,
  debounceDelay = 300,
  name,
  placeholder = ' ',
  ...uniformProps
}: TextAreaProps) => {
  const { field } = useUniformField({
    ...uniformProps,
    name,
    placeholder,
  });

  // debounce form updates, flush pending edits on blur
  const { value, onChange, onBlur } = useInputValueDebounce({
    debounceDelay,
    name,
    onBlur: field.onBlur,
    onChange: field.onChange,
    value: field.value,
  });

  return (
    <TextAreaControl
      className={className}
      field={{ ...field, onBlur, onChange, value }}
      placeholder={placeholder}
    />
  );
};

export default TextArea;
