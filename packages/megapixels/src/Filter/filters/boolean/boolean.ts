/* eslint-disable import-x/prefer-default-export */

import type { Config, Value } from './schema';

import createFilter from '../createFilter';
import Display from './Display';
import Form from './Form';
import { validate } from './schema';

export const boolean = createFilter<Config, Value>({
  components: { Display, Form },
  defaults: {
    value: true,
    config: { text: 'Active', textPrefix: 'is', textNoWord: 'no' },
  },
  validation: validate,
});
