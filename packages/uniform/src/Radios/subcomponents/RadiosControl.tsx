import type { UniformField } from '../../hooks/useUniformField/types';
import type { RadiosProps } from '../Radios';

import { Label } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { createOptionValueConverter } from '../../helpers';
import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import RadioGroupField from '../../partials/RadioGroupField/RadioGroupField';
import { radiosVariants } from '../radiosVariants';
import RadioControl from './RadioControl';
import radioControlVariants from './radioControlVariants';

interface RadiosControlProps extends Pick<
  RadiosProps,
  'children' | 'className' | 'inline' | 'options'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, string | number | boolean>;
}

/**
 * Radio options and custom list composition
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
const RadiosControl = ({
  field,
  children,
  className,
  inline = false,
  options,
}: RadiosControlProps) => {
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
    value,
  } = field;

  // associate the editable control with its label and messages
  const controlProps = getFieldControlProps(field);

  const styling = useStyling();

  const { convertToOriginalType } = createOptionValueConverter(options);

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

  // restore the selected option's original value type
  const handleChange = (nextValue: string) => {
    onValueChange(convertToOriginalType(nextValue));
  };

  return (
    <FieldLayout
      baseAs={RadioGroupField}
      baseProps={{
        controlProps,
        disabled,
        inline,
        inputRef,
        invalid,
        name,
        onBlur,
        onChange: handleChange,
        required,
        testId,
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
  );
};

export default RadiosControl;
