import { expect, it } from 'vitest';

import v, { vEnum } from 'src';

it('rejects invalid enum value', () => {
  const schema = { enumField: vEnum(['ONE', 'TWO']) };
  const result = v(schema).validate({ enumField: 'THREE' });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      enumField: [
        {
          code: 'invalid_value',
          message: 'Invalid option: expected one of "ONE"|"TWO"',
          values: ['ONE', 'TWO'],
        },
      ],
    },
  });
});

it('reject undefined enum value with empty error', () => {
  const schema = { enumField: vEnum(['ONE', 'TWO']) };
  const result = v(schema).validate({ enumField: undefined });
  expect(result).toMatchObject({
    success: false,
    errors: {
      enumField: [
        {
          code: 'invalid_value',
          message: 'Field is required',
        },
      ],
    },
  });
});

it('reject empty string enum value with empty error', () => {
  const schema = { enumField: vEnum(['ONE', 'TWO']) };
  const result = v(schema).validate({ enumField: '' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      enumField: [
        {
          code: 'invalid_value',
          message: 'Field is required',
        },
      ],
    },
  });
});

it('accepts valid enum value', () => {
  const schema = { enumField: vEnum(['ONE', 'TWO']) };
  const result = v(schema).validate({ enumField: 'TWO' });
  expect(result).toStrictEqual({
    success: true,
    data: {
      enumField: 'TWO',
    },
    errors: null,
  });
});
