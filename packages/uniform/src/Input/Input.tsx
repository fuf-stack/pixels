import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';
import type inputVariants from './inputVariants';

import { useRef, useState } from 'react';
import {
  Input as AriaInput,
  Button,
  Group,
  NumberField,
  TextField,
} from 'react-aria-components';
import { useFocusRing } from 'react-aria/useFocusRing';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import useUniformFieldState from '../hooks/useUniformFieldState/useUniformFieldState';
import { FieldHints, FieldLabel } from '../partials/FieldLayout/FieldLayout';
import { inputStateVariants } from './inputVariants';

export { default as inputVariants } from './inputVariants';

type VariantProps = TVProps<typeof inputVariants>;
type ClassName = TVClassName<typeof inputVariants>;

export interface InputProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** shows clear button when input has value */
  clearable?: boolean;
  /** debounce delay in milliseconds for form state updates (default: 300ms) */
  debounceDelay?: number;
  /** Help text associated with the editable control. */
  description?: ReactNode;
  /** input field is disabled */
  disabled?: boolean;
  /** added content to the end of the input Field. */
  endContent?: ReactNode;
  /** form field label */
  label?: ReactNode;
  /** form field name */
  name: string;
  /** callback that is fired when the value is cleared */
  onClear?: () => void;
  /** form field placeholder */
  placeholder?: string;
  /** size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** content added to the start of the input field */
  startContent?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** allows disentangled display and form values for a field */
  transform?: InputValueTransform<string>;
  /** input type */
  type?: 'number' | 'password';
}

const Chevron = ({ up = false }: { up?: boolean }) => {
  return (
    <svg
      aria-hidden
      fill="none"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="1em"
    >
      <path d={up ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  );
};

/** Form input with owned presentation and React Aria interactions. */
const Input = ({
  className = undefined,
  clearable = false,
  debounceDelay = 300,
  endContent = undefined,
  startContent = undefined,
  size = 'md',
  type = undefined,
  name,
  onClear = undefined,
  placeholder = ' ',
  ...uniformProps
}: InputProps) => {
  const {
    field: { value: fieldValue, onChange: fieldOnChange, onBlur: fieldOnBlur },
    disabled,
    invalid,
    required,
    label,
    description,
    errorMessage,
    ids,
    ref,
    resetField,
    testId,
    getControlProps,
  } = useUniformFieldState({
    name,
    type,
    ...uniformProps,
    ariaLabel:
      uniformProps.ariaLabel ??
      (!uniformProps.label && placeholder.trim() ? placeholder : undefined),
  });
  const styling = useStyling();
  const controlRef = useRef<HTMLInputElement>(null);
  const {
    focusProps,
    isFocused: focused,
    isFocusVisible,
  } = useFocusRing({
    within: true,
    isTextInput: true,
  });
  const [hovered, setHovered] = useState(false);
  const { value, onChange, onBlur, cancelPendingChange } =
    useInputValueDebounce({
      name,
      debounceDelay,
      value: fieldValue,
      onChange: fieldOnChange,
      onBlur: fieldOnBlur,
    });
  const classes = styling.variantsToClassNames(
    styling.resolve(inputStateVariants, {
      size,
      disabled,
      invalid,
      number: type === 'number',
      clearable,
      filled: value !== '' && value != null,
    }),
    className,
    'base',
  );
  const hasValue = value !== '' && value !== null && value !== undefined;
  const clear = () => {
    cancelPendingChange('');
    resetField(name, { defaultValue: null });
    onClear?.();
    controlRef.current?.focus();
  };
  const controlProps = getControlProps();
  const rootProps = {
    ...controlProps,
    name,
    className: classes.base,
    'data-slot': 'base',
    'data-focus': focused || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-hover': hovered || undefined,
    'data-filled': hasValue || !!placeholder || !!startContent || undefined,
    'data-filled-within':
      hasValue || focused || !!placeholder || !!startContent || undefined,
    'data-focus-within': focused || undefined,
    'data-required': required || undefined,
    'data-has-label': !!label || undefined,
    'data-has-helper': true,
    'data-has-elements': true,
    'data-has-value': hasValue || !placeholder || undefined,
    'data-disabled': disabled ? true : undefined,
    'data-invalid': invalid || undefined,
    isDisabled: disabled,
    isInvalid: invalid,
    isRequired: required,
    validationBehavior: 'aria' as const,
    onBlur: () => {
      onBlur();
    },
  };
  const content = (
    <>
      <FieldLabel
        className={classes.label}
        ids={ids}
        label={label}
        required={required}
      />
      <Group
        {...focusProps}
        className={classes.inputWrapper}
        data-focus={focused || undefined}
        data-hover={hovered || undefined}
        data-slot="input-wrapper"
        onClick={(event) => {
          if (!disabled && event.currentTarget === event.target) {
            controlRef.current?.focus();
          }
        }}
        onHoverEnd={() => {
          setHovered(false);
        }}
        onHoverStart={() => {
          setHovered(true);
        }}
      >
        <div className={classes.innerWrapper} data-slot="inner-wrapper">
          {startContent}
          <AriaInput
            ref={(node) => {
              controlRef.current = node;
              ref(node);
            }}
            {...controlProps}
            autoComplete="off"
            className={classes.input}
            data-filled={hasValue || undefined}
            data-has-end-content={
              !!endContent || (clearable && hasValue) || undefined
            }
            data-has-start-content={!!startContent || undefined}
            data-slot="input"
            data-testid={testId}
            onChange={type === 'number' ? onChange : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && clearable && hasValue) {
                e.preventDefault();
                clear();
              }
            }}
            placeholder={placeholder}
          />
          {clearable && hasValue ? (
            <Button
              aria-label="clear input"
              className={classes.clearButton}
              data-slot="clear-button"
              isDisabled={disabled}
              onPress={clear}
              preventFocusOnPress
              slot={null}
            >
              {type !== 'number' && endContent ? (
                endContent
              ) : (
                <svg aria-hidden height="1em" viewBox="0 0 24 24" width="1em">
                  <path
                    d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </Button>
          ) : null}
          {!clearable || type === 'number' ? endContent : null}
          {type === 'number' ? (
            <div className={classes.stepper} data-slot="stepper-wrapper">
              <Button
                className={classes.stepperButton}
                data-slot="increase-button"
                slot="increment"
                tabIndex={-1}
              >
                <Chevron up />
              </Button>
              <Button
                className={classes.stepperButton}
                data-slot="decrease-button"
                slot="decrement"
                tabIndex={-1}
              >
                <Chevron />
              </Button>
            </div>
          ) : null}
        </div>
      </Group>
      <FieldHints
        classes={classes}
        description={description}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
      />
    </>
  );
  if (type === 'number') {
    const numericValue = value !== '' && value != null ? Number(value) : NaN;
    return (
      <NumberField
        {...rootProps}
        formatOptions={{ useGrouping: false }}
        onChange={(next) => {
          onChange({
            target: { value: Number.isNaN(next) ? '' : String(next) },
          });
        }}
        value={numericValue}
      >
        {content}
      </NumberField>
    );
  }
  return (
    <TextField
      {...rootProps}
      onChange={(next) => {
        onChange({ target: { value: next } });
      }}
      type={type ?? 'text'}
      value={String(value ?? '')}
    >
      {content}
    </TextField>
  );
};

export default Input;
