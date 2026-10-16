import type { CheckboxGroupProps } from 'react-aria-components';
import type { FieldPresentationProps } from '../../partials/types';
import type { CheckboxesProps } from '../Checkboxes';

import { CheckboxGroup, Label } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldDescription from '../../partials/FieldDescription/FieldDescription';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';
import { checkboxesVariants } from '../checkboxesVariants';
import CheckboxControl from './CheckboxControl';

interface CheckboxesControlProps
  extends
    Pick<
      CheckboxesProps,
      | 'children'
      | 'className'
      | 'color'
      | 'description'
      | 'disabled'
      | 'inline'
      | 'label'
      | 'lineThrough'
      | 'name'
      | 'options'
    >,
    FieldPresentationProps<string[]> {
  /** Connects form focus requests to an enabled checkbox */
  inputRef: (control: Pick<HTMLElement, 'focus'> | null) => void;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Checkbox group presentation with option composition and focus routing
 *
 * @see https://react-aria.adobe.com/CheckboxGroup
 */
const CheckboxesControl = ({
  children,
  className,
  color = 'primary',
  controlProps,
  description,
  disabled,
  errorMessage,
  ids,
  inline = false,
  inputRef,
  invalid,
  label,
  lineThrough,
  name,
  onBlur,
  onValueChange,
  options,
  required,
  testId,
  value,
}: CheckboxesControlProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(checkboxesVariants, {
    lineThrough,
    invalid,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  const associations = controlProps;
  const describedBy =
    [
      associations['aria-describedby'],
      required ? `${ids.control}-required` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const renderedOptions = options?.map((option) => {
    const optionDisabled = !!disabled || !!option.disabled;

    return {
      option,
      state: {
        checked: value.includes(option.value),
        disabled: optionDisabled,
        invalid: !!invalid,
      },
      checkbox: (
        <CheckboxControl
          key={`index_${option.value}`}
          className={classNames}
          color={color === 'info' ? 'primary' : color}
          describedBy={describedBy}
          disabled={optionDisabled}
          invalid={invalid}
          option={option}
          testId={slugify(`${testId}_option_${option.testId ?? option.value}`, {
            replaceDots: true,
          })}
        />
      ),
    };
  });

  // route form focus to the first enabled checkbox
  const handleControlRef = (node: HTMLDivElement | null) => {
    inputRef(
      node
        ? {
            focus: () => {
              node
                .querySelector<HTMLInputElement>('input:not(:disabled)')
                ?.focus();
            },
          }
        : null,
    );
  };

  // keep the group styling state on its root
  const renderGroup: NonNullable<CheckboxGroupProps['render']> = (props) => {
    return (
      <div
        {...props}
        aria-invalid={invalid || undefined}
        data-invalid={invalid}
        data-required={required}
      >
        {props.children}
      </div>
    );
  };

  return (
    <CheckboxGroup
      ref={handleControlRef}
      aria-describedby={describedBy}
      aria-invalid={associations['aria-invalid']}
      aria-label={associations['aria-label']}
      className={classNames.base}
      data-slot="base"
      data-testid={testId}
      id={associations.id}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      name={name}
      onBlur={onBlur}
      onChange={onValueChange}
      render={renderGroup}
      validationBehavior="aria"
      value={value}
    >
      {label ? (
        <FieldLabel
          as={Label}
          className={classNames.label}
          id={ids.label}
          required={required}
        >
          {label}
        </FieldLabel>
      ) : null}
      {required ? (
        <span className="sr-only" id={`${ids.control}-required`}>
          Required selection.
        </span>
      ) : null}
      <div
        className={classNames.wrapper}
        data-orientation={inline ? 'horizontal' : 'vertical'}
        data-slot="wrapper"
      >
        {children
          ? children(renderedOptions ?? [])
          : renderedOptions?.map(({ checkbox }) => {
              return checkbox;
            })}
      </div>
      {description || invalid ? (
        <div className={classNames.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={classNames.description}
            id={ids.description}
          >
            {description}
          </FieldDescription>
          {invalid ? (
            <div
              className={classNames.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </CheckboxGroup>
  );
};

export default CheckboxesControl;
