/* eslint-disable vitest/expect-expect */

import type { VLiteralSchema } from './literal';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { literal } from 'src';

it('exposes literal schema typing', () => {
  const schema = literal('X');

  expectTypeOf(schema).toEqualTypeOf<VLiteralSchema<'X'>>();
  expectTypeOf(schema.parse('X')).toEqualTypeOf<'X'>();
});

it('rejects non-Literal input', () => {
  const schema = { literalField: literal(4) };
  const result = veto(schema).validate({ literalField: '4' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      literalField: [
        {
          code: 'invalid_literal',
          expected: 4,
          message: 'Invalid literal value, expected 4',
        },
      ],
    },
  });
});

it('accepts Literal input', () => {
  const schema = { literalField: literal(true) };
  const result = veto(schema).validate({ literalField: true });
  expect(result).toMatchObject({
    success: true,
    data: { literalField: true },
  });
});

// TODO: more tests?
