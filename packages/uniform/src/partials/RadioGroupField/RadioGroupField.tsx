import type { ReactNode } from 'react';
import type { RadioGroupProps } from 'react-aria-components';
import type { FieldControlProps } from '../types';

import { useRef } from 'react';
import { RadioGroup } from 'react-aria-components';

import RadioGroupDescriptionContext from './RadioGroupDescriptionContext';

interface RadioGroupFieldProps {
  /** Group content, including its label and options */
  children: ReactNode;
  /** CSS class name */
  className?: string;
  /** Control ID, explicit accessible name and supporting message IDs */
  controlProps: Pick<
    FieldControlProps,
    'id' | 'aria-label' | 'aria-describedby'
  >;
  /** Identifies the public component owning the radio group */
  dataComponent?: string;
  /** Disables every option */
  disabled?: boolean;
  /** Arranges options horizontally */
  inline: boolean;
  /** Connects form focus requests to the selected or first enabled option */
  inputRef: (control: Pick<HTMLElement, 'focus'> | null) => void;
  /** Marks visible validation failure */
  invalid: boolean;
  /** Field name */
  name: string;
  /** Callback when focus leaves the group */
  onBlur: () => void;
  /** Callback with the selected option's string value */
  onChange: (value: string) => void;
  /** Marks the group as required */
  required: boolean;
  /** HTML data-testid attribute */
  testId: string;
  /** Selected value, nullish values become an empty selection */
  value: unknown;
}

/**
 * React Aria radio-group engine with option focus routing and shared descriptions
 *
 * Receives bound values and callbacks, without registering a form field.
 * Its children own the field layout and option presentation.
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
const RadioGroupField = ({
  children,
  className = undefined,
  controlProps,
  dataComponent = undefined,
  disabled = undefined,
  inputRef,
  invalid,
  inline,
  name,
  onBlur,
  onChange,
  required,
  testId,
  value,
}: RadioGroupFieldProps) => {
  const groupRef = useRef<HTMLDivElement>(null);

  // focus the selected enabled option, otherwise the first enabled option
  const handleFocus = () => {
    const input =
      groupRef.current?.querySelector<HTMLInputElement>(
        'input:checked:not(:disabled)',
      ) ??
      groupRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)');
    input?.focus();
  };

  // expose option focus through the binding ref
  const setControlRef = (node: HTMLDivElement | null) => {
    groupRef.current = node;
    inputRef(node ? { focus: handleFocus } : null);
  };

  // preserve the group's existing state selectors on the actual root
  const renderGroup: NonNullable<RadioGroupProps['render']> = (props) => {
    return (
      <div {...props} data-invalid={invalid} data-required={required}>
        {props.children}
      </div>
    );
  };

  return (
    <RadioGroup
      ref={setControlRef}
      aria-describedby={controlProps['aria-describedby']}
      aria-label={controlProps['aria-label']}
      className={className}
      data-component={dataComponent}
      data-invalid={invalid}
      data-required={required}
      data-slot="base"
      data-testid={testId}
      id={controlProps.id}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      orientation={inline ? 'horizontal' : 'vertical'}
      render={renderGroup}
      validationBehavior="aria"
      value={value != null ? String(value) : ''}
    >
      <RadioGroupDescriptionContext.Provider
        value={controlProps['aria-describedby']}
      >
        {children}
      </RadioGroupDescriptionContext.Provider>
    </RadioGroup>
  );
};

export default RadioGroupField;
