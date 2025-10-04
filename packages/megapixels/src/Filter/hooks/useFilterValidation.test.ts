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
    expect(valid).toMatchObject({
      success: true,
      data: { filter: { status: true, owners: ['a'] } },
      errors: null,
    });

    const invalid = schema.validate({
      filter: { status: 'invalid', owners: [] },
    });
    expect(invalid).toMatchObject({ success: false, data: null });
  });

  it('validates optional search string when enabled', () => {
    const { result } = renderHook(() => useFilterValidation(filters, true));
    const schema = result.current;

    // include valid filter content so only search is under test
    const ok = schema.validate({ search: 'abc', filter: { owners: ['x'] } });
    expect(ok).toMatchObject({
      success: true,
      data: { search: 'abc', filter: { owners: ['x'] } },
      errors: null,
    });

    const invalidSearch = schema.validate({
      search: 123 as unknown as string,
      filter: { owners: ['x'] },
    });
    expect(invalidSearch).toMatchObject({ success: false, data: null });
  });

  it('parses stringified JSON filter into object in output data', () => {
    const { result } = renderHook(() => useFilterValidation(filters, true));
    const schema = result.current;

    const jsonFilter = JSON.stringify({ status: true, owners: ['x'] });
    const validationResult = schema.validate({
      search: 'ok',
      filter: jsonFilter,
    });
    expect(validationResult).toMatchObject({
      success: true,
      data: { search: 'ok', filter: { status: true, owners: ['x'] } },
      errors: null,
    });
  });

  it('accepts when filter is null and returns undefined filter data', () => {
    const { result } = renderHook(() => useFilterValidation(filters, true));
    const schema = result.current;

    const validationResult = schema.validate({ search: 'test', filter: null });
    expect(validationResult).toMatchObject({
      success: true,
      // filter should be undefined
      data: { filter: undefined, search: 'test' },
      errors: null,
    });
  });

  it('accepts when filter is omitted and and returns undefined filter data', () => {
    const { result } = renderHook(() => useFilterValidation(filters, true));
    const schema = result.current;

    const validationResult = schema.validate({
      search: 'test',
      filter: undefined,
    });
    expect(validationResult).toMatchObject({
      success: true,
      // filter should be undefined
      data: { filter: undefined, search: 'test' },
      errors: null,
    });
  });
});
