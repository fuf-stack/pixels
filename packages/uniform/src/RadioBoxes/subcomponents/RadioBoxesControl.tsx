import type { FieldPresentationProps } from '../../partials/types';
import type { RadioBoxesProps } from '../RadioBoxes';
import type { RadioBoxProps } from './RadioBox';

import { Label } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import RadioGroupField from '../../partials/RadioGroupField/RadioGroupField';
import { radioBoxesVariants } from '../radioBoxesVariants';
import { RadioBox } from './RadioBox';

interface RadioBoxesControlProps
  extends
    Pick<
      RadioBoxesProps,
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
 * Radio boxes with shared group layout and focus routing
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
const RadioBoxesControl = ({
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
}: RadioBoxesControlProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(radioBoxesVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  const boxClassNames: RadioBoxProps['className'] = {
    base: classNames.boxBase,
    control: classNames.boxControl,
    description: classNames.boxDescription,
    label: classNames.boxLabel,
    labelWrapper: classNames.boxLabelWrapper,
  };

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
          {options.map((option) => {
            if ('value' in option) {
              const optionTestId = slugify(
                `${testId}_option_${option.testId ?? option.value}`,
                { replaceDots: true },
              );
              return (
                <RadioBox
                  key={String(option.value)}
                  className={boxClassNames}
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
    </RadioGroupField>
  );
};

export default RadioBoxesControl;
