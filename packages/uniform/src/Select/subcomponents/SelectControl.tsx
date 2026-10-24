import type { UniformField } from '../../hooks/useUniformField/types';
import type { SelectProps } from '../Select';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { getFieldDataAttributes } from '../../helpers/fieldProps/fieldProps';
import FieldLayout from '../../partials/FieldLayout/FieldLayout';
import { selectVariants } from '../selectVariants';
import SelectCombobox from './SelectCombobox';

interface SelectControlProps extends Omit<
  SelectProps,
  keyof UniformField | 'transform'
> {
  /** Bound field values, interactions and metadata */
  field: UniformField;
  /** Reads the current touched state after a selection commits */
  getIsTouched: () => boolean;
}

/** Searchable selection field layout and styling around the option engine */
const SelectControl = ({ className, field, ...props }: SelectControlProps) => {
  const styling = useStyling();

  const {
    description,
    disabled,
    errorMessage,
    ids,
    invalid,
    label,
    required,
    testId,
  } = field;

  // classNames from slots
  const variants = styling.resolve(selectVariants, { disabled, invalid });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <FieldLayout
      baseProps={{
        ...getFieldDataAttributes(field),
        'data-testid': `${testId}_wrapper`,
      }}
      className={classNames}
      description={description}
      errorMessage={errorMessage}
      ids={ids}
      invalid={invalid}
      label={label}
      required={required}
    >
      <SelectCombobox {...props} className={classNames} field={field} />
    </FieldLayout>
  );
};

export default SelectControl;
