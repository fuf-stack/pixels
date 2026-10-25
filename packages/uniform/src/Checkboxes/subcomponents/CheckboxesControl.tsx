import type { CheckboxGroupProps } from 'react-aria-components';
import type { UniformField } from '../../hooks/useUniformField/types';
import type { CheckboxesProps } from '../Checkboxes';

import { CheckboxGroup, Label } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { checkboxesVariants } from '../checkboxesVariants';
import CheckboxControl from './CheckboxControl';

interface CheckboxesControlProps extends Pick<
  CheckboxesProps,
  'children' | 'className' | 'color' | 'inline' | 'lineThrough' | 'options'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, string[]>;
}

/**
 * Checkbox group presentation with option composition and focus routing
 *
 * @see https://react-aria.adobe.com/CheckboxGroup
 */
const CheckboxesControl = ({
  field,
  children,
  className,
  color = 'primary',
  inline = false,
  lineThrough,
  options,
}: CheckboxesControlProps) => {
  const {
    description,
    disabled,
    errorMessage,
    ids,
    ref: inputRef,
    invalid,
    label,
    name,
    onBlur,
    onChange: onValueChange,
    required,
    testId,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const styling = useStyling();

  // treat non-array form values as an empty selection
  const value = Array.isArray(field.value) ? field.value : [];

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
    <FieldLayout
      baseAs={CheckboxGroup}
      baseProps={{
        'aria-describedby': describedBy,
        'aria-label': associations['aria-label'],
        'data-component': 'checkboxes',
        'data-slot': 'base',
        'data-testid': testId,
        id: associations.id,
        isDisabled: disabled,
        isInvalid: invalid,
        isRequired: required,
        name,
        onBlur,
        onChange: onValueChange,
        ref: handleControlRef,
        render: renderGroup,
        validationBehavior: 'aria',
        value,
      }}
      className={classNames}
      description={description}
      errorMessage={errorMessage}
      ids={ids}
      invalid={invalid}
      label={label}
      labelAs={Label}
      required={required}
    >
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
    </FieldLayout>
  );
};

export default CheckboxesControl;
