/* eslint-disable vitest/expect-expect */

import type { VObjectSchema } from './object';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { object, string } from 'src';

const schema = {
  objectField: object({ key: string() }),
};

const validInput = { objectField: { key: 'some string' } };

it('exposes object schema typing', () => {
  const objectSchema = object({ key: string() });

  expectTypeOf(objectSchema).toEqualTypeOf<
    VObjectSchema<{ key: ReturnType<typeof string> }>
  >();
  expectTypeOf(objectSchema.parse({ key: 'value' })).toEqualTypeOf<{
    key: string;
  }>();
});

it('rejects missing fields', () => {
  const result = veto(schema).validate({
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
  const result = veto(schema).validate({
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
            message: "Unrecognized key(s) in object: 'otherField'",
          },
        ],
      },
    },
  });
});

it('keeps unknown-key and missing-field errors on the same object', () => {
  const result = veto(schema).validate({
    objectField: {
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
            message: "Unrecognized key(s) in object: 'otherField'",
          },
        ],
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

it('rejects non-object value', () => {
  const result = veto(schema).validate({
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
            message: 'Expected object, received array',
            received: 'array',
          },
        ],
      },
    },
  });
});

it('accepts valid object value', () => {
  const result = veto(schema).validate(validInput);
  expect(result).toStrictEqual({
    success: true,
    data: validInput,
    errors: null,
  });
});
