import type { UniformField } from '../../hooks/useUniformField/types';
import type { RadioBoxesProps } from '../RadioBoxes';

import { Label } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { createOptionValueConverter } from '../../helpers';
import { getFieldControlProps } from '../../helpers/fieldProps/fieldProps';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import RadioGroupField from '../../partials/RadioGroupField/RadioGroupField';
import { radioBoxesVariants } from '../radioBoxesVariants';
import { RadioBox } from './RadioBox';

interface RadioBoxesControlProps extends Pick<
  RadioBoxesProps,
  'className' | 'inline' | 'options'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, string | number | boolean>;
}

/**
 * Radio boxes with shared group layout and focus routing
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
const RadioBoxesControl = ({
  field,
  className,
  inline = false,
  options,
}: RadioBoxesControlProps) => {
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
  const variants = styling.resolve(radioBoxesVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

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
        {options.map((option) => {
          if ('value' in option) {
            const optionTestId = slugify(
              `${testId}_option_${option.testId ?? option.value}`,
              { replaceDots: true },
            );
            return (
              <RadioBox
                key={String(option.value)}
                className={{
                  base: classNames.boxBase,
                  control: classNames.boxControl,
                  description: classNames.boxDescription,
                  label: classNames.boxLabel,
                  labelWrapper: classNames.boxLabelWrapper,
                }}
                data-testid={optionTestId}
                description={option.description}
                icon={option.icon}
                isDisabled={!!disabled || option.disabled}
                isInvalid={invalid}
                value={String(option.value)}
              >
                {option.label ?? option.value}
              </RadioBox>
            );
          }
          return null;
        })}
      </div>
    </FieldLayout>
  );
};

export default RadioBoxesControl;
