import { expect, expectTypeOf, it } from 'vitest';

import veto, { string } from 'src';
import { stringCommon } from 'test/helpers';

// common string tests
stringCommon(
  { stringField: string() },
  {
    // allow input
    shouldAllow: ['a string', 'a string 123'],
  },
);

it('trims whitespace from value', () => {
  const schema = { stringField: string() };
  const result = veto(schema).validate({ stringField: '  some value  ' });
  expect(result).toMatchObject({
    success: true,
    errors: null,
    data: { stringField: 'some value' },
  });
});

it('expects min length of 1 by default', () => {
  const schema = { stringField: string() };
  const result = veto(schema).validate({ stringField: '' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      stringField: [
        {
          code: 'too_small',
          inclusive: true,
          message: 'String must contain at least 1 character(s)',
          minimum: 1,
          type: 'string',
        },
      ],
    },
  });
});

it('option min changes expected length', () => {
  const schema = { stringField: string({ min: 100 }) };
  const result = veto(schema).validate({ stringField: '' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      stringField: [
        {
          code: 'too_small',
          inclusive: true,
          message: 'String must contain at least 100 character(s)',
          minimum: 100,
          type: 'string',
        },
      ],
    },
  });
});

it('option mix is checked after whitespace is trimmed', () => {
  const schema = { stringField: string({ min: 5 }) };
  const result = veto(schema).validate({ stringField: '  test  ' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      stringField: [
        {
          code: 'too_small',
          inclusive: true,
          message: 'String must contain at least 5 character(s)',
          minimum: 5,
          type: 'string',
        },
      ],
    },
  });
});

it('supports chaining built-in methods after refine', () => {
  const refinedBase = string().refine(
    (val) => !val.includes('bad'),
    'Must not contain bad',
  );
  const refined = (refinedBase as unknown as ReturnType<typeof string>).max(5);

  expectTypeOf(refined.parse('hello')).toEqualTypeOf<string>();
  expect(typeof (refinedBase as { max?: unknown }).max).toBe('function');
  const schema = { stringField: refined };
  const result = veto(schema).validate({ stringField: 'badvalue' });
  const issues = (result as { errors?: { stringField?: unknown } }).errors
    ?.stringField as unknown[];

  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'custom',
        message: 'Must not contain bad',
      }),
      expect.objectContaining({
        code: 'too_big',
        maximum: 5,
        message: 'String must contain at most 5 character(s)',
        type: 'string',
      }),
    ]),
  );
  expect(result).toMatchObject({
    success: false,
  });
});

it('supports chaining built-in methods after superRefine', () => {
  const superRefinedBase = string().superRefine((val, ctx) => {
    if (val.includes('bad')) {
      ctx.addIssue({ code: 'custom', message: 'Must not contain bad' });
    }
  });
  const superRefined = (
    superRefinedBase as unknown as ReturnType<typeof string>
  ).max(5);

  expectTypeOf(superRefined.parse('hello')).toEqualTypeOf<string>();
  expect(typeof (superRefinedBase as { max?: unknown }).max).toBe('function');
  const schema = { stringField: superRefined };
  const result = veto(schema).validate({ stringField: 'badvalue' });
  const issues = (result as { errors?: { stringField?: unknown } }).errors
    ?.stringField as unknown[];

  expect(issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'custom',
        message: 'Must not contain bad',
      }),
      expect.objectContaining({
        code: 'too_big',
        maximum: 5,
        message: 'String must contain at most 5 character(s)',
        type: 'string',
      }),
    ]),
  );
  expect(result).toMatchObject({
    success: false,
  });
});
