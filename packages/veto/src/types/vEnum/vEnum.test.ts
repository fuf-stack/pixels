/* eslint-disable vitest/expect-expect */

import { expect, expectTypeOf, it } from 'vitest';

import veto, { vEnum } from 'src';

it('exposes enum schema typing', () => {
  const schema = vEnum(['ONE', 'TWO'] as const);
  expectTypeOf(schema.parse('ONE')).toEqualTypeOf<'ONE' | 'TWO'>();
});

it('rejects invalid enum value', () => {
  const schema = { enumField: vEnum(['ONE', 'TWO']) };
  const result = veto(schema).validate({ enumField: 'THREE' });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      enumField: [
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

it('accepts valid enum value', () => {
  const schema = { enumField: vEnum(['ONE', 'TWO']) };
  const result = veto(schema).validate({ enumField: 'TWO' });
  expect(result).toStrictEqual({
    success: true,
    data: {
      enumField: 'TWO',
    },
    errors: null,
  });
});

it('exposes enum options metadata', () => {
  const schema = vEnum(['ONE', 'TWO'] as const);
  expect(schema.options).toStrictEqual(['ONE', 'TWO']);
});

it('supports extract and exclude helpers', () => {
  const schema = vEnum(['ONE', 'TWO'] as const);
  const onlyOne = schema.extract(['ONE']);
  const withoutOne = schema.exclude(['ONE']);

  expectTypeOf(onlyOne.parse('ONE')).toEqualTypeOf<'ONE'>();
  expectTypeOf(withoutOne.parse('TWO')).toEqualTypeOf<'TWO'>();

  expect(onlyOne.safeParse('TWO').success).toBe(false);
  expect(withoutOne.safeParse('ONE').success).toBe(false);
});
