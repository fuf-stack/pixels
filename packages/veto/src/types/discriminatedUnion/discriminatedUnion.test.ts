import { expect, it } from 'vitest';

import v, { discriminatedUnion, literal, number, object, string } from 'src';

const schema = {
  discriminatedUnionField: discriminatedUnion('mode', [
    object({ mode: literal('STRING'), stringField: string() }),
    object({ mode: literal('NUMBER'), numberField: number() }),
  ]),
};

it('rejects undefined discriminator', () => {
  const result = v(schema).validate({
    discriminatedUnionField: {},
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      discriminatedUnionField: {
        mode: [
          {
            code: 'invalid_union',
            discriminator: 'mode',
            errors: [],
            message: 'Invalid input',
            note: 'No matching discriminator',
          },
        ],
      },
    },
  });
});

it('rejects fields that are not defined in option', () => {
  const result = v(schema).validate({
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
            message: 'Unrecognized key: "numberField"',
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
  const result = v(schema).validate(data);
  expect(result).toStrictEqual({
    success: true,
    data,
    errors: null,
  });
});
