/* eslint-disable import-x/prefer-default-export */

import type { Config, Value } from './schema';

import createFilter from '../createFilter';
import Display from './Display';
import Form from './Form';
import { validate } from './schema';

/**
 * Checkbox group filter definition for the Filter system.
 * Provides Display and Form components, default value/config, and validation.
 *
 * Defaults:
 * - value: []
 * - config: { text: 'Options', options: [] }
 *
 * @see Display
 * @see Form
 * @see validate
 */
export const checkboxgroup = createFilter<Config, Value>({
  components: { Display, Form },
  defaults: { value: [], config: { text: 'Options', options: [] } },
  validation: validate,
});
