/* eslint-disable vitest/expect-expect */

import { expect, expectTypeOf, it } from 'vitest';

import veto, {
  and,
  discriminatedUnion,
  literal,
  nativeEnum,
  objectLoose,
  string,
  vEnum,
} from 'src';

it('exposes intersection typing', () => {
  const schema = and(
    objectLoose({ baseField: string() }),
    objectLoose({ mode: literal('TYPE') }),
  );

  const parsed = schema.parse({ baseField: 'x', mode: 'TYPE' });
  const typedParsed: {
    baseField: string;
    mode: 'TYPE';
  } = parsed;
  expectTypeOf(typedParsed).toEqualTypeOf<{
    baseField: string;
    mode: 'TYPE';
  }>();
});

it('combines multiple string schema validations correctly', () => {
  const schema = { andField: and(string(), string().min(4)) };
  const result = veto(schema).validate({ andField: 'thisString' });
  expect(result).toMatchObject({
    success: true,
    errors: null,
  });

  const result2 = veto(schema).validate({ andField: 'the' });
  expect(result2).toMatchObject({
    data: null,
    errors: {
      andField: [
        {
          code: 'too_small',
          inclusive: true,
          message: 'String must contain at least 4 character(s)',
          minimum: 4,
          type: 'string',
        },
      ],
    },
    success: false,
  });
});

it('combines enum string schema validations correctly', () => {
  const schema = {
    andField: and(
      nativeEnum({ TWO: '2', FOUR: '4' } as const),
      vEnum(['2', '1', '0']),
    ),
  };
  const result1 = veto(schema).validate({ andField: '2' });
  expect(result1).toMatchObject({
    success: true,
    errors: null,
  });

  const result2 = veto(schema).validate({ andField: '4' });
  expect(result2).toMatchObject({
    success: false,
  });

  const result3 = veto(schema).validate({ andField: '10' });
  expect(result3).toMatchObject({
    success: false,
  });
});

it('combines loose object and discriminatedUnion schemas as expected', () => {
  const baseSchema = objectLoose({
    baseField: string(),
    comment: string().optional(),
  });
  const discriminatedUnionSchema = discriminatedUnion('type', [
    objectLoose({ type: literal('typeA') }),
    objectLoose({ type: literal('typeB'), bField: string() }),
  ]);
  const combinedSchema = and(baseSchema, discriminatedUnionSchema);

  const data = {
    baseField: 'some A',
    type: 'typeB',
    bField: 'some b field data',
  };
  const result = veto(combinedSchema).validate(data);
  expect(result).toMatchObject({
    success: true,
    data,
    errors: null,
  });
});

it('throws expected errors for loose object and discriminatedUnion schemas', () => {
  const baseSchema = objectLoose({
    baseField: string(),
    comment: string().optional(),
  });
  const discriminatedUnionSchema = discriminatedUnion('type', [
    objectLoose({ type: literal('typeA') }),
    objectLoose({ type: literal('typeB'), bField: string() }),
  ]);
  const combinedSchema = and(baseSchema, discriminatedUnionSchema);

  const data = { type: 'typeB', invalidField: false };
  const result = veto(combinedSchema).validate(data);
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      bField: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Field is required',
          received: 'undefined',
        },
      ],
      baseField: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Field is required',
          received: 'undefined',
        },
      ],
    },
  });
});
