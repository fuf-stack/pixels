/* eslint-disable vitest/expect-expect */

import type { VNativeEnumSchema } from './nativeEnum';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { nativeEnum } from 'src';

it('exposes nativeEnum typing', () => {
  const schema = nativeEnum({ ONE: 'ONE', TWO: 'TWO' } as const);
  expectTypeOf(schema).toEqualTypeOf<VNativeEnumSchema>();
  expect(schema.parse('ONE')).toBe('ONE');
});

it('rejects invalid enum value', () => {
  const schema = {
    nativeEnumField: nativeEnum({ ONE: 'ONE', TWO: 'TWO' } as const),
  };
  const result = veto(schema).validate({ nativeEnumField: 'THREE' });

  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      nativeEnumField: [
        {
          code: 'invalid_enum_value',
          message:
            "Invalid enum value. Expected 'ONE' | 'TWO', received 'THREE'",
          options: ['ONE', 'TWO'],
          received: 'THREE',
        },
      ],
    },
  });
});

it('accepts valid string enum value', () => {
  const schema = {
    nativeEnumField: nativeEnum({ ONE: 'ONE', TWO: 'TWO' } as const),
  };
  const result = veto(schema).validate({ nativeEnumField: 'TWO' });
  expect(result).toStrictEqual({
    success: true,
    data: {
      nativeEnumField: 'TWO',
    },
    errors: null,
  });
});

it('accepts valid mixed enum value', () => {
  const schema = {
    nativeEnumField: nativeEnum({ ONE: 'ONE', TWO: 'TWO', THREE: 3 } as const),
  };
  const result = veto(schema).validate({ nativeEnumField: 3 });
  expect(result).toStrictEqual({
    success: true,
    data: {
      nativeEnumField: 3,
    },
    errors: null,
  });
});
