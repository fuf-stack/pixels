import type { ReactNode } from 'react';
import type { InputProps } from './Input';

import { useRef, useState } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';
import {
  Input as AriaInput,
  Button,
  Group,
  NumberField,
  TextField,
} from 'react-aria-components';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import useUniformFieldState from '../hooks/useUniformField/useUniformFieldState';
import { FieldHints, FieldLabel } from '../partials/FieldLayout/FieldLayout';
import inputVariants from './inputVariants';

const prototypeVariants = tv({
  extend: inputVariants,
  slots: {
    base: 'group relative flex w-full flex-col gap-1',
    inputWrapper:
      'shadow-xs relative inline-flex h-10 min-h-10 w-full items-center rounded-small border-medium border-default-200 bg-content1 px-3 transition-colors data-[hovered]:border-default-400 group-data-[disabled=true]:pointer-events-none group-data-[focus=true]:border-focus group-data-[invalid=true]:border-danger motion-reduce:transition-none',
    innerWrapper: 'inline-flex h-full w-full items-center gap-0',
    input:
      'w-full min-w-0 bg-transparent text-foreground outline-none text-small placeholder:text-foreground-500',
    clearButton:
      'cursor-pointer rounded-full p-0.5 text-default-500 outline-none hover:text-default-700 focus-visible:outline-2 focus-visible:outline-focus',
    label:
      'block cursor-default text-foreground text-small group-data-[invalid=true]:text-danger',
    helperWrapper: 'relative flex flex-col p-0',
    description: 'text-foreground-500 text-tiny',
    errorMessage: 'text-danger text-tiny',
    stepper: 'flex h-full flex-col justify-center ps-1',
    stepperButton:
      'flex h-3 w-3 items-center justify-center text-default-foreground outline-none hover:opacity-hover focus-visible:outline-2 focus-visible:outline-focus',
  },
  variants: {
    size: {
      sm: {
        inputWrapper: 'h-8 min-h-8',
        input: 'text-tiny',
        label: 'text-tiny',
      },
      md: {},
      lg: {
        inputWrapper: 'h-12 min-h-12',
        input: 'text-medium',
        label: 'text-medium',
      },
    },
    disabled: { true: { base: 'opacity-disabled' } },
    invalid: {
      true: {
        input: 'text-danger',
        label: 'text-danger',
        inputWrapper:
          'border-danger data-[hovered]:border-danger group-data-[focus=true]:border-danger',
      },
    },
  },
});

const Chevron = ({ up = false }: { up?: boolean }) => {
  return (
    <svg
      aria-hidden
      fill="none"
      height="1em"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      width="1em"
    >
      <path d={up ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  );
};

/** Risk prototype; not a public package entry point. */
const InputAriaPrototype = ({
  className,
  clearable = false,
  debounceDelay = 300,
  endContent,
  startContent,
  size = 'md',
  type,
  name,
  onClear,
  placeholder = ' ',
  ...uniformProps
}: InputProps & { description?: ReactNode }) => {
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
  const { focusProps, isFocused: focused, isFocusVisible } = useFocusRing({ within: true, isTextInput: true });
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
    styling.resolve(prototypeVariants, {
      size,
      disabled,
      invalid,
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
    'data-filled': hasValue || undefined,
    'data-filled-within': hasValue || focused || !!label || undefined,
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
        data-slot="input-wrapper"
        data-hover={hovered || undefined}
        data-focus={focused || undefined}
        onHoverStart={() => {
          setHovered(true);
        }}
        onHoverEnd={() => {
          setHovered(false);
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
            data-slot="input"
            data-filled={hasValue || undefined}
            data-has-start-content={!!startContent || undefined}
            data-has-end-content={
              !!endContent || (clearable && hasValue) || undefined
            }
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
              <svg aria-hidden height="1em" viewBox="0 0 16 16" width="1em">
                <path
                  d="m4 3 4 4 4-4 1 1-4 4 4 4-1 1-4-4-4 4-1-1 4-4-4-4z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          ) : (
            endContent
          )}
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
        ids={ids}
        description={description}
        invalid={invalid}
        errorMessage={errorMessage}
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

export default InputAriaPrototype;
