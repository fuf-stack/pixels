import type { FiltersConfiguration } from '../filters/types';

import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { filters as f } from '..';
import { useFilterValidation } from './useFilterValidation';

const filters: FiltersConfiguration = [
  f.boolean({ name: 'status' }),
  f.checkboxgroup({
    name: 'owners',
    config: {
      text: 'Owners',
      options: [
        { label: 'Alice', value: 'a' },
        { label: 'Xavier', value: 'x' },
        { label: 'Bob', value: 'b' },
      ],
    },
  }),
];

describe('useFilterValidation', () => {
  it('accepts valid filter shapes and rejects invalid ones', () => {
    const { result } = renderHook(() => useFilterValidation(filters, false));
    const schema = result.current;

    const valid = schema.validate({ filter: { status: true, owners: ['a'] } });
    expect(valid.errors).toBeNull();

    const invalid = schema.validate({
      filter: { status: 'invalid', owners: [] },
    });
    expect(invalid.errors).not.toBeNull();
  });

  it('validates optional search string when enabled', () => {
    const { result } = renderHook(() => useFilterValidation(filters, true));
    const schema = result.current;

    // include valid filter content so only search is under test
    expect(
      schema.validate({ search: 'abc', filter: { owners: ['x'] } }).errors,
    ).toBe(null);
    expect(
      schema.validate({ search: 123, filter: { owners: ['x'] } }).errors,
    ).not.toBeNull();
    expect(
      schema.validate({
        search: 123,
        filter: JSON.stringify({ owners: ['x'] }),
      }).errors,
    ).not.toBeNull();
  });
});
