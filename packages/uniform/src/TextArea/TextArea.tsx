import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type textAreaVariants from './textAreaVariants';

import { useRef, useState } from 'react';
import { Group } from 'react-aria-components';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useTextField } from 'react-aria/useTextField';
import TextareaAutosize from 'react-textarea-autosize';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import useUniformFieldState from '../hooks/useUniformField/useUniformFieldState';
import { FieldHints, FieldLabel } from '../partials/FieldLayout/FieldLayout';
import { textAreaStateVariants } from './textAreaVariants';

export { default as textAreaVariants } from './textAreaVariants';

type VariantProps = TVProps<typeof textAreaVariants>;
type ClassName = TVClassName<typeof textAreaVariants>;

export interface TextAreaProps extends VariantProps {
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

/** Owned multiline field with React Aria behavior and three-to-eight-row autosizing. */
const TextArea = ({
  className = undefined,
  debounceDelay = 300,
  name,
  placeholder = ' ',
  ...uniformProps
}: TextAreaProps) => {
  const {
    field: { value: fieldValue, onChange: fieldOnChange, onBlur: fieldOnBlur },
    ref,
    disabled,
    invalid,
    required,
    label,
    description,
    errorMessage,
    ids,
    testId,
    getControlProps,
  } = useUniformFieldState({
    name,
    ...uniformProps,
    ariaLabel:
      uniformProps.ariaLabel ??
      (!uniformProps.label && placeholder.trim() ? placeholder : undefined),
  });
  const controlRef = useRef<HTMLTextAreaElement>(null);
  const { focusProps, isFocused, isFocusVisible } = useFocusRing({
    within: true,
    isTextInput: true,
  });
  const [hovered, setHovered] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const { value, onChange, onBlur } = useInputValueDebounce({
    name,
    debounceDelay,
    value: fieldValue,
    onChange: fieldOnChange,
    onBlur: fieldOnBlur,
  });
  const hasValue = value !== '' && value != null;
  const associations = getControlProps();
  const { inputProps } = useTextField(
    {
      ...associations,
      inputElementType: 'textarea',
      name,
      value: String(value ?? ''),
      onChange,
      onBlur,
      isDisabled: disabled,
      isInvalid: invalid,
      isRequired: required,
      validationBehavior: 'aria',
    },
    controlRef,
  );
  const styling = useStyling();
  const classes = styling.variantsToClassNames(
    styling.resolve(textAreaStateVariants, {
      disabled,
      invalid,
      filled: hasValue,
    }),
    className,
    'base',
  );

  return (
    <div
      {...focusProps}
      className={classes.base}
      data-disabled={disabled ? true : undefined}
      data-filled={hasValue || !!placeholder || undefined}
      data-filled-within={hasValue || isFocused || !!placeholder || undefined}
      data-focus={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focus-within={isFocused || undefined}
      data-has-elements
      data-has-helper
      data-has-label={!!label || undefined}
      data-has-value={hasValue || !placeholder || undefined}
      data-hover={hovered || undefined}
      data-invalid={invalid || undefined}
      data-required={required || undefined}
      data-slot="base"
    >
      <FieldLabel
        className={classes.label}
        ids={ids}
        label={label}
        required={required}
      />
      <Group
        className={classes.inputWrapper}
        data-focus={isFocused || undefined}
        data-has-multiple-rows
        data-hover={hovered || undefined}
        data-slot="input-wrapper"
        isDisabled={disabled}
        onClick={(event) => {
          if (!disabled && event.target === event.currentTarget) {
            controlRef.current?.focus();
          }
        }}
        onHoverEnd={() => {
          setHovered(false);
        }}
        onHoverStart={() => {
          setHovered(true);
        }}
        role="presentation"
      >
        <div className={classes.innerWrapper} data-slot="inner-wrapper">
          <TextareaAutosize
            {...inputProps}
            {...associations}
            ref={(node) => {
              controlRef.current = node;
              ref(node);
            }}
            className={classes.input}
            data-filled={hasValue || undefined}
            data-hide-scroll={!limitReached || undefined}
            data-slot="input"
            data-testid={testId}
            maxRows={8}
            minRows={3}
            onHeightChange={(height, { rowHeight }) => {
              setLimitReached(height >= rowHeight * 8);
            }}
            placeholder={placeholder}
          />
        </div>
      </Group>
      <FieldHints
        classes={classes}
        description={description}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
      />
    </div>
  );
};

export default TextArea;
