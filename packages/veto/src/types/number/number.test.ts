import type { VNumberSchema } from './number';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { number } from 'src';

it('exposes number schema typing', () => {
  const schema = number();
  const intSchema = schema.int();

  expectTypeOf(number).returns.toEqualTypeOf<VNumberSchema>();
  expectTypeOf(number()).toEqualTypeOf<VNumberSchema>();
  expectTypeOf(schema.parse(1.5)).toEqualTypeOf<number>();
  expectTypeOf(intSchema.parse(1)).toEqualTypeOf<number>();
  expect(schema.safeParse(1).success).toBe(true);
});

it('rejects non-number input', () => {
  const schema = { numberField: number() };
  const result = veto(schema).validate({ numberField: 'a string' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      numberField: [
        {
          code: 'invalid_type',
          expected: 'number',
          message: 'Expected number, received string',
          received: 'string',
        },
      ],
    },
  });
});

[1, 1.1].forEach((value) => {
  it(`accepts value '${value}'`, () => {
    const schema = { numberField: number() };
    const result = veto(schema).validate({ numberField: value });
    expect(result).toMatchObject({
      success: true,
      data: { numberField: value },
      errors: null,
    });
  });
});

it('supports chaining built-in methods after refine', () => {
  const refined = number()
    .refine((val) => val % 2 === 0, 'Must be even')
    .max(10);

  expectTypeOf(refined.parse(8)).toEqualTypeOf<number>();

  const result = veto({ numberField: refined }).validate({ numberField: 11 });
  const issues = (result as { errors?: { numberField?: unknown } }).errors
    ?.numberField as unknown[];

  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: 'custom', message: 'Must be even' }),
      expect.objectContaining({
        code: 'too_big',
        maximum: 10,
      }),
    ]),
  );
});

it('supports chaining built-in methods after superRefine', () => {
  const superRefined = number()
    .superRefine((val, ctx) => {
      if (val % 2 !== 0) {
        ctx.addIssue({ code: 'custom', message: 'Must be even' });
      }
    })
    .max(10);

  expectTypeOf(superRefined.parse(8)).toEqualTypeOf<number>();

  const result = veto({ numberField: superRefined }).validate({
    numberField: 11,
  });
  const issues = (result as { errors?: { numberField?: unknown } }).errors
    ?.numberField as unknown[];

  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: 'custom', message: 'Must be even' }),
      expect.objectContaining({
        code: 'too_big',
        maximum: 10,
      }),
    ]),
  );
});
