import type { FieldError } from 'react-hook-form';

import { describe, expect, it } from 'vitest';

import { flattenFieldErrors } from './flattenFieldErrors';

describe('flattenFieldErrors', () => {
  it('flattens nested object-shaped errors', () => {
    const indexedError: FieldError = {
      message: 'Invalid option at index',
      type: 'custom',
    };
    const arrayLevelError: FieldError = {
      message: 'At least one option is required',
      type: 'custom',
    };

    const error = {
      0: [indexedError],
      _errors: [arrayLevelError],
    };

    expect(flattenFieldErrors(error)).toEqual([indexedError, arrayLevelError]);
  });

  it('returns flat arrays unchanged', () => {
    const error: FieldError = {
      message: 'Selection is required',
      type: 'required',
    };

    expect(flattenFieldErrors([error])).toEqual([error]);
  });
});
