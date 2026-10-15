import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
//
import type { RadioBoxProps } from './RadioBox';

import { slugify, tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { createOptionValueConverter } from '../helpers';
import useUniformFieldState from '../hooks/useUniformFieldState/useUniformFieldState';
import { RadioLayout } from '../partials/RadioLayout/RadioLayout';
import { RadioBox } from './RadioBox';

export const radioBoxesVariants = tv({
  slots: {
    base: [
      // Needs group for group-data condition.
      'group',
      // Match shared field wrapper layout.
      'flex w-full flex-col',
      // Keep spacing between label/radio boxes consistent.
      'gap-y-1.5',
    ],
    boxBase: '',
    boxControl: '',
    boxDescription: '',
    boxLabel: '',
    boxLabelWrapper: '',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'mb-2 inline-flex cursor-default text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    wrapper:
      'flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row',
  },
});

type VariantProps = TVProps<typeof radioBoxesVariants>;
type ClassName = TVClassName<typeof radioBoxesVariants>;

export interface RadioBoxOption {
  /** Description of the value. Works with variant radioBox. */
  description?: ReactNode;
  /** disables the option */
  disabled?: boolean;
  /** option label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string | number;
}

export interface RadioBoxesProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Determines if the Buttons are disabled or not. */
  disabled?: boolean;
  /** Optional help text associated with the radio group. */
  description?: ReactNode;
  /** determines orientation of the Buttons. */
  inline?: boolean;
  /** Label displayed next to the RadioButton. */
  label?: ReactNode;
  /** Name the RadioButtons are registered at in HTML forms (react-hook-form). */
  name: string;
  /** Radio button configuration. */
  options: RadioBoxOption[];
  /** Id to grab element in internal tests. */
  testId?: string;
}

/**
 * Card-shaped radios with owned presentation and React Aria interactions
 */
const RadioBoxes = ({
  className = undefined,
  inline = false,
  name,
  options,
  ...uniformFieldProps
}: RadioBoxesProps) => {
  const field = useUniformFieldState({ name, ...uniformFieldProps });
  const { disabled, invalid, testId } = field;

  // Create converter to preserve number types for option values
  const { convertToOriginalType } = createOptionValueConverter(options);

  // classNames from slots
  const styling = useStyling();
  const classNames = styling.variantsToClassNames(
    styling.resolve(radioBoxesVariants),
    className,
    'base',
  );
  const boxClassNames: RadioBoxProps['classNames'] = {
    base: classNames.boxBase,
    control: classNames.boxControl,
    description: classNames.boxDescription,
    label: classNames.boxLabel,
    labelWrapper: classNames.boxLabelWrapper,
  };

  return (
    <RadioLayout
      classes={{ ...classNames, errorMessage: 'text-danger text-tiny' }}
      field={field}
      inline={inline}
      onChange={(newValue) => field.onChange(convertToOriginalType(newValue))}
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
              classNames={boxClassNames}
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
    </RadioLayout>
  );
};

export default RadioBoxes;
