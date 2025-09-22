import type { FilterFormProps } from '../types';
import type { Config } from './schema';

import CheckboxGroup from '@fuf-stack/uniform/CheckboxGroup';

const Form = ({ fieldName, config }: FilterFormProps<Config>) => {
  return <CheckboxGroup name={fieldName} options={config.options} />;
};

export default Form;
