import type { FieldPresentationProps } from '../../partials/types';
import type { RadiosProps } from '../Radios';

import { Label } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import RadioGroupField from '../../partials/RadioGroupField/RadioGroupField';
import { radiosVariants } from '../radiosVariants';
import RadioControl from './RadioControl';
import radioControlVariants from './radioControlVariants';

interface RadiosControlProps
  extends
    Pick<
      RadiosProps,
      | 'children'
      | 'className'
      | 'description'
      | 'disabled'
      | 'inline'
      | 'label'
      | 'name'
      | 'options'
      | 'testId'
    >,
    FieldPresentationProps<unknown, string> {
  /** Connects form focus requests to an enabled radio option */
  inputRef: (control: Pick<HTMLElement, 'focus'> | null) => void;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Radio options and custom list composition
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
const RadiosControl = ({
  children,
  className,
  controlProps,
  description,
  disabled,
  errorMessage,
  ids,
  inline = false,
  inputRef,
  invalid,
  label,
  name,
  onBlur,
  onValueChange,
  options,
  required,
  testId,
  value,
}: RadiosControlProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(radiosVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  const optionVariants = styling.resolve(radioControlVariants, { invalid });
  const itemClassNames = styling.variantsToClassNames(optionVariants, {
    base: classNames.itemBase,
    control: classNames.itemControl,
    description: classNames.itemDescription,
    label: classNames.itemLabel,
    labelWrapper: classNames.itemLabelWrapper,
    wrapper: classNames.itemWrapper,
  });

  const selectedValue = value != null ? String(value) : '';

  // share option elements between default and custom layouts
  const renderedOptions = options.map((option) => {
    const optionTestId = slugify(
      `${testId}_option_${option.testId ?? option.value}`,
      { replaceDots: true },
    );
    const optionIsDisabled = !!disabled || !!option.disabled;
    const optionValue = String(option.value);
    const radio = (
      <RadioControl
        key={optionValue}
        className={itemClassNames}
        disabled={optionIsDisabled}
        invalid={invalid}
        testId={optionTestId}
        value={optionValue}
      >
        {option.label ?? option.value}
      </RadioControl>
    );

    return {
      option,
      radio,
      state: {
        selected: selectedValue === optionValue,
        disabled: optionIsDisabled,
        invalid: !!invalid,
      },
    };
  });

  return (
    <RadioGroupField
      className={classNames.base}
      controlProps={controlProps}
      disabled={disabled}
      inline={inline}
      inputRef={inputRef}
      invalid={invalid}
      name={name}
      onBlur={onBlur}
      onChange={onValueChange}
      required={required}
      testId={testId}
      value={value}
    >
      <FieldLayout
        className={classNames}
        description={description}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
        label={label}
        labelAs={Label}
        required={required}
      >
        <div
          className={classNames.wrapper}
          data-orientation={inline ? 'horizontal' : 'vertical'}
          data-slot="wrapper"
        >
          {/* Child render function can fully control list layout; fallback keeps default rendering. */}
          {children
            ? children(renderedOptions)
            : renderedOptions.map(({ radio }) => {
                return radio;
              })}
        </div>
      </FieldLayout>
    </RadioGroupField>
  );
};

export default RadiosControl;
