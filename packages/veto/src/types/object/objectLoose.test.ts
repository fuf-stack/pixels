import { expect, it } from 'vitest';

import v, { objectLoose, string } from 'src';

const schema = {
  objectLooseField: objectLoose({ key: string() }),
};

const validInput = { objectLooseField: { key: 'some string' } };

it('rejects missing fields', () => {
  const result = v(schema).validate({
    objectLooseField: {},
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      objectLooseField: {
        key: [
          {
            code: 'invalid_type',
            expected: 'string',
            message: 'Field is required',
            received: 'undefined',
          },
        ],
      },
    },
  });
});

it('accepts unknown fields and strips data', () => {
  const validUnknownInput = {
    objectLooseField: {
      key: 'some string',
      otherField: 'some other string',
    },
  };
  const result = v(schema).validate(validUnknownInput);
  expect(result).toStrictEqual({
    success: true,
    // otherField is striped from input
    data: validInput,
    errors: null,
  });
});

it('rejects non-object value', () => {
  const result = v(schema).validate({
    objectLooseField: ['some string'],
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      objectLooseField: {
        _errors: [
          {
            code: 'invalid_type',
            expected: 'object',
            message: 'Invalid input: expected object, received array',
            received: 'array',
          },
        ],
      },
    },
  });
});

it('accepts valid objectLoose value', () => {
  const result = v(schema).validate(validInput);
  expect(result).toStrictEqual({
    success: true,
    data: validInput,
    errors: null,
  });
});
