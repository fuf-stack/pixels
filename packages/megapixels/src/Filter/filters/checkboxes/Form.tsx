import type { FilterFormProps } from '../types';
import type { Config } from './schema';

import Checkboxes from '@fuf-stack/uniform/Checkboxes';

/**
 * Renders the form control for the checkboxes filter.
 * Uses a `Checkboxes` to select multiple options.
 */
const Form = ({ fieldName, config }: FilterFormProps<Config>) => {
  return <Checkboxes name={fieldName} options={config.options} />;
};

export default Form;
