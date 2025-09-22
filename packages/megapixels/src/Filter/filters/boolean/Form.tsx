import type { FilterFormProps } from '../types';
import type { Config } from './schema';

import Switch from '@fuf-stack/uniform/Switch';

const Form = ({
  fieldName,
  config: { text, textPrefix },
}: FilterFormProps<Config>) => {
  return <Switch label={`${textPrefix} ${text}`} name={fieldName} />;
};

export default Form;
