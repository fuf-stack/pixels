/* eslint-disable vitest/expect-expect */

import type { VBooleanSchema } from './boolean';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { boolean } from 'src';

it('exposes boolean schema typing', () => {
  const schema = boolean();
  const refined = schema.refine((val) => val).default(true);

  expectTypeOf(boolean).returns.toEqualTypeOf<VBooleanSchema>();
  expectTypeOf(schema).toEqualTypeOf<VBooleanSchema>();
  expectTypeOf(refined.parse(undefined)).toEqualTypeOf<boolean>();
});

it('rejects non-boolean value', () => {
  const schema = { booleanField: boolean() };
  const result = veto(schema).validate({ booleanField: 'a string' });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      booleanField: [
        {
          code: 'invalid_type',
          expected: 'boolean',
          message: 'Expected boolean, received string',
          received: 'string',
        },
      ],
    },
  });
});

it('can be optional', () => {
  const schema = { booleanField: boolean().optional() };
  const result = veto(schema).validate({});
  expect(result).toStrictEqual({
    success: true,
    data: {},
    errors: null,
  });
});

[true, false].forEach((value) => {
  it(`accepts value '${value}'`, () => {
    const schema = { booleanField: boolean() };
    const result = veto(schema).validate({ booleanField: value });
    expect(result).toStrictEqual({
      success: true,
      data: { booleanField: value },
      errors: null,
    });
  });
});
