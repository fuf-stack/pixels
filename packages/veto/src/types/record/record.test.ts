import type { VRecordSchema } from './record';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { record, string } from 'src';

const schema = {
  recordField: record(string()),
};

const validInput = {
  recordField: {
    key1: 'value1',
    key2: 'value2',
  },
};

it('exposes record schema typing', () => {
  const typedRecord = record(string());
  const typedFactory: typeof record = record;
  const typedSchema: VRecordSchema<ReturnType<typeof string>> = typedRecord;

  expectTypeOf(typedFactory).toEqualTypeOf<typeof record>();
  expectTypeOf(typedSchema).toEqualTypeOf<
    VRecordSchema<ReturnType<typeof string>>
  >();
  expectTypeOf(typedRecord.parse({ key: 'value' })).toEqualTypeOf<
    Record<string, string>
  >();
  expect(typedRecord.safeParse({ key: 'value' }).success).toBe(true);
});

it('accepts valid record with string values', () => {
  const result = veto(schema).validate(validInput);
  expect(result).toStrictEqual({
    success: true,
    data: validInput,
    errors: null,
  });
});

it('rejects non-record value', () => {
  const result = veto(schema).validate({
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
            message: 'Expected record, received array',
            received: 'array',
          },
        ],
      },
    },
  });
});

it('rejects invalid value types in record', () => {
  const result = veto(schema).validate({
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
            message: 'Expected string, received number',
            received: 'number',
          },
        ],
      },
    },
  });
});

it('accepts empty record', () => {
  const result = veto(schema).validate({
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
  const result = veto(schema).validate(input);
  expect(result).toStrictEqual({
    success: true,
    data: input,
    errors: null,
  });
});

it('rejects record with mixed valid and invalid values', () => {
  const result = veto(schema).validate({
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
            message: 'Expected string, received number',
            received: 'number',
          },
        ],
        invalid2: [
          {
            code: 'invalid_type',
            expected: 'string',
            message: 'Expected string, received boolean',
            received: 'boolean',
          },
        ],
      },
    },
  });
});
