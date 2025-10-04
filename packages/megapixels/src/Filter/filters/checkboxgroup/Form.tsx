import type { FilterFormProps } from '../types';
import type { Config } from './schema';

import CheckboxGroup from '@fuf-stack/uniform/CheckboxGroup';

/**
 * Renders the form control for the checkbox group filter.
 * Uses a `CheckboxGroup` to select multiple options.
 */
const Form = ({ fieldName, config }: FilterFormProps<Config>) => {
  return <CheckboxGroup name={fieldName} options={config.options} />;
};

export default Form;
