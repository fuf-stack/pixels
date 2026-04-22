import { expect, it } from 'vitest';

import veto, { discriminatedUnion, literal, number, object, string } from 'src';

const schema = {
  discriminatedUnionField: discriminatedUnion('mode', [
    object({ mode: literal('STRING'), stringField: string() }),
    object({ mode: literal('NUMBER'), numberField: number() }),
  ]),
};

it('rejects undefined discriminator', () => {
  const result = veto(schema).validate({
    discriminatedUnionField: {},
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      discriminatedUnionField: {
        mode: [
          {
            // Zod v4 collapsed `invalid_union_discriminator` into `invalid_union`.
            code: 'invalid_union',
            message: 'Field is required',
            options: ['STRING', 'NUMBER'],
            received: 'undefined',
          },
        ],
      },
    },
  });
});

it('rejects fields that are not defined in option', () => {
  const result = veto(schema).validate({
    discriminatedUnionField: { mode: 'STRING', numberField: 123 },
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      discriminatedUnionField: {
        _errors: [
          {
            code: 'unrecognized_keys',
            keys: ['numberField'],
            message: "Unrecognized key(s) in object: 'numberField'",
          },
        ],
        stringField: [
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

it('accepts valid option', () => {
  const data = {
    discriminatedUnionField: { mode: 'NUMBER', numberField: 123 },
  };
  const result = veto(schema).validate(data);
  expect(result).toStrictEqual({
    success: true,
    data,
    errors: null,
  });
});
