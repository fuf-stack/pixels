/* eslint-disable import-x/prefer-default-export */

import type { Config, Value } from './schema';

import createFilter from '../createFilter';
import Display from './Display';
import Form from './Form';
import { validate } from './schema';

/**
 * Boolean filter definition for the Filter system.
 * Provides Display and Form components, default value/config, and validation.
 *
 * Defaults:
 * - value: true
 * - config: { text: 'Active', textPrefix: 'is', textNoWord: 'no' }
 *
 * @see Display
 * @see Form
 * @see validate
 */
export const boolean = createFilter<Config, Value>({
  components: { Display, Form },
  defaults: {
    value: true,
    config: { text: 'Active', textPrefix: 'is', textNoWord: 'no' },
  },
  validation: validate,
});
