import { expect, it } from 'vitest';

import v, { record, string } from 'src';

const schema = {
  recordField: record(string()),
};

const validInput = {
  recordField: {
    key1: 'value1',
    key2: 'value2',
  },
};

it('accepts valid record with string values', () => {
  const result = v(schema).validate(validInput);
  expect(result).toStrictEqual({
    success: true,
    data: validInput,
    errors: null,
  });
});

it('rejects non-record value', () => {
  const result = v(schema).validate({
    recordField: ['some string'],
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      recordField: {
        _errors: [
          {
            code: 'invalid_type',
            expected: 'record',
            message: 'Invalid input: expected record, received array',
            received: 'array',
          },
        ],
      },
    },
  });
});

it('rejects invalid value types in record', () => {
  const result = v(schema).validate({
    recordField: {
      key1: 'valid string',
      key2: 123, // number instead of string
    },
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      recordField: {
        key2: [
          {
            code: 'invalid_type',
            expected: 'string',
            message: 'Invalid input: expected string, received number',
            received: 'number',
          },
        ],
      },
    },
  });
});

it('accepts empty record', () => {
  const result = v(schema).validate({
    recordField: {},
  });
  expect(result).toStrictEqual({
    success: true,
    data: {
      recordField: {},
    },
    errors: null,
  });
});

it('accepts record with multiple valid entries', () => {
  const input = {
    recordField: {
      a: 'value1',
      b: 'value2',
      c: 'value3',
      d: 'value4',
    },
  };
  const result = v(schema).validate(input);
  expect(result).toStrictEqual({
    success: true,
    data: input,
    errors: null,
  });
});

it('rejects record with mixed valid and invalid values', () => {
  const result = v(schema).validate({
    recordField: {
      valid1: 'string',
      invalid1: 123,
      valid2: 'string',
      invalid2: false,
    },
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      recordField: {
        invalid1: [
          {
            code: 'invalid_type',
            expected: 'string',
            message: 'Invalid input: expected string, received number',
            received: 'number',
          },
        ],
        invalid2: [
          {
            code: 'invalid_type',
            expected: 'string',
            message: 'Invalid input: expected string, received boolean',
            received: 'boolean',
          },
        ],
      },
    },
  });
});
