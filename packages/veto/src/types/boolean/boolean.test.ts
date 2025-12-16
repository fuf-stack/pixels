import { expect, it } from 'vitest';

import v, { boolean } from 'src';

it('rejects non-boolean value', () => {
  const schema = { booleanField: boolean() };
  const result = v(schema).validate({ booleanField: 'a string' });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      booleanField: [
        {
          code: 'invalid_type',
          expected: 'boolean',
          message: 'Invalid input: expected boolean, received string',
          received: 'string',
        },
      ],
    },
  });
});

it('can be optional', () => {
  const schema = { booleanField: boolean().optional() };
  const result = v(schema).validate({});
  expect(result).toStrictEqual({
    success: true,
    data: {},
    errors: null,
  });
});

// eslint-disable-next-line array-callback-return
[true, false].map((value) => {
  it(`accepts value '${value}'`, () => {
    const schema = { booleanField: boolean() };
    const result = v(schema).validate({ booleanField: value });
    expect(result).toStrictEqual({
      success: true,
      data: { booleanField: value },
      errors: null,
    });
  });
});
