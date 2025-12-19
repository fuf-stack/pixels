import { expect, it } from 'vitest';

import v, {
  and,
  discriminatedUnion,
  literal,
  nativeEnum,
  objectLoose,
  string,
  vEnum,
} from 'src';

it('combines multiple string schema validations correctly', () => {
  const schema = { andField: and(string(), string().min(4)) };
  const result = v(schema).validate({ andField: 'thisString' });
  expect(result).toMatchObject({
    success: true,
    errors: null,
  });

  const result2 = v(schema).validate({ andField: 'the' });
  expect(result2).toMatchObject({
    data: null,
    errors: {
      andField: [
        {
          code: 'too_small',
          inclusive: true,
          message: 'Too small: expected string to have >=4 characters',
          minimum: 4,
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
  const result1 = v(schema).validate({ andField: '2' });
  expect(result1).toMatchObject({
    success: true,
    errors: null,
  });

  const result2 = v(schema).validate({ andField: '4' });
  expect(result2).toMatchObject({
    success: false,
  });

  const result3 = v(schema).validate({ andField: '10' });
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
  const result = v(combinedSchema).validate(data);
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
  const result = v(combinedSchema).validate(data);
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
