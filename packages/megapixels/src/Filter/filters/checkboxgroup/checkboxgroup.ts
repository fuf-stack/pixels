/* eslint-disable import-x/prefer-default-export */

import type { Config, Value } from './schema';

import createFilter from '../createFilter';
import Display from './Display';
import Form from './Form';
import { validate } from './schema';

export const checkboxgroup = createFilter<Config, Value>({
  components: { Display, Form },
  defaults: { value: [], config: { text: 'Options', options: [] } },
  validation: validate,
});
