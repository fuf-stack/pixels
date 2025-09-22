import { expect, it } from 'vitest';

import v, { string } from 'src';
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
  const result = v(schema).validate({ stringField: '  some value  ' });
  expect(result).toMatchObject({
    success: true,
    errors: null,
    data: { stringField: 'some value' },
  });
});

it('expects min length of 1 by default', () => {
  const schema = { stringField: string() };
  const result = v(schema).validate({ stringField: '' });
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
  const result = v(schema).validate({ stringField: '' });
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
  const result = v(schema).validate({ stringField: '  test  ' });
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
