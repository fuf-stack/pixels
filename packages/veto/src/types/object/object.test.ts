import { expect, it } from 'vitest';

import v, { object, string } from 'src';

const schema = {
  objectField: object({ key: string() }),
};

const validInput = { objectField: { key: 'some string' } };

it('rejects missing fields', () => {
  const result = v(schema).validate({
    objectField: {},
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      objectField: {
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

it('rejects unknown fields', () => {
  const result = v(schema).validate({
    objectField: {
      key: 'some string',
      otherField: 'some other string',
    },
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      objectField: {
        _errors: [
          {
            code: 'unrecognized_keys',
            keys: ['otherField'],
            message: 'Unrecognized key: "otherField"',
          },
        ],
      },
    },
  });
});

it('rejects non-object value', () => {
  const result = v(schema).validate({
    objectField: ['some string'],
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      objectField: {
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

it('accepts valid object value', () => {
  const result = v(schema).validate(validInput);
  expect(result).toStrictEqual({
    success: true,
    data: validInput,
    errors: null,
  });
});
