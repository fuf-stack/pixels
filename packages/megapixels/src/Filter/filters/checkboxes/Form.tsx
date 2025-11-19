import type { FilterFormProps } from '../types';
import type { Config } from './schema';

import Checkboxes from '@fuf-stack/uniform/Checkboxes';

/**
 * Renders the form control for the checkboxes filter.
 * Uses a `Checkboxes` to select multiple options.
 * Resolves function labels with 'form' mode.
 */
const Form = ({ fieldName, config }: FilterFormProps<Config>) => {
  const resolvedOptions = config.options.map((option) => {
    return {
      ...option,
      label:
        typeof option.label === 'function'
          ? option.label('form')
          : option.label,
    };
  });

  return <Checkboxes name={fieldName} options={resolvedOptions} />;
};

export default Form;
