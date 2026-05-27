import type { Output } from 'src';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { literal, number, or, string } from 'src';

it('exposes union typing for two branches', () => {
  const schema = or(literal('A'), number());
  expect(schema.safeParse('A').success).toBe(true);

  expectTypeOf<Output<typeof schema>>().toEqualTypeOf<'A' | number>();
});

it('exposes union typing for multiple branches', () => {
  const schema = or(literal('A'), literal('B'), number().min(10), {
    error: 'Value must satisfy at least one allowed shape',
  });
  expect(schema.safeParse('B').success).toBe(true);

  expectTypeOf<Output<typeof schema>>().toEqualTypeOf<'A' | 'B' | number>();
});

it('passes when at least one branch validates', () => {
  const schema = {
    value: or(literal('A'), string().regex(/^B\d+$/)),
  };

  const result = veto(schema).validate({ value: 'A' });
  expect(result).toMatchObject({
    success: true,
    errors: null,
  });
});

it('supports more than two branches', () => {
  const schema = {
    value: or(literal('A'), literal('B'), number().min(10)),
  };

  const result = veto(schema).validate({ value: 'B' });
  expect(result).toMatchObject({
    success: true,
    errors: null,
  });
});

it('matches native union behavior when error is omitted', () => {
  const valueSchema = or(string().min(3), number().min(10));
  const nativeValueSchema = string().min(3).or(number().min(10));

  const result = veto({ value: valueSchema }).validate({ value: 2 });
  const nativeResult = veto({ value: nativeValueSchema }).validate({
    value: 2,
  });

  expect(result).toEqual(nativeResult);
});

it('supports more than two branches with error option', () => {
  const schema = {
    value: or(literal('A'), number().min(10), string().regex(/^B\d+$/), {
      error: 'Value must satisfy at least one allowed shape',
    }),
  };

  const result = veto(schema).validate({ value: false });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      value: [
        {
          code: 'custom',
          message: 'Value must satisfy at least one allowed shape',
        },
      ],
    },
  });
});

it('returns a single custom issue when error is set', () => {
  const schema = {
    value: or(string().min(3), number().min(10), {
      error: 'Value must satisfy at least one allowed shape',
    }),
  };

  const result = veto(schema).validate({ value: 2 });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      value: [
        {
          code: 'custom',
          message: 'Value must satisfy at least one allowed shape',
        },
      ],
    },
  });
});
