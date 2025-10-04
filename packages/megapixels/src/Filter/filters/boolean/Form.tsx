import type { FilterFormProps } from '../types';
import type { Config } from './schema';

import Switch from '@fuf-stack/uniform/Switch';

/**
 * Renders the form control for the boolean filter.
 * Uses a `Switch` to toggle the boolean value and composes
 * the label from the provided `config` and `fieldName`.
 */
const Form = ({
  fieldName,
  config: { text, textPrefix },
}: FilterFormProps<Config>) => {
  return <Switch label={`${textPrefix} ${text}`} name={fieldName} />;
};

export default Form;
