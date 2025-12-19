import { expect, it } from 'vitest';

import v, { number } from 'src';

it('rejects non-number input', () => {
  const schema = { numberField: number() };
  const result = v(schema).validate({ numberField: 'a string' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      numberField: [
        {
          code: 'invalid_type',
          expected: 'number',
          message: 'Invalid input: expected number, received string',
          received: 'string',
        },
      ],
    },
  });
});

// eslint-disable-next-line array-callback-return
[1, 1.1].map((value) => {
  it(`accepts value '${value}'`, () => {
    const schema = { numberField: number() };
    const result = v(schema).validate({ numberField: value });
    expect(result).toMatchObject({
      success: true,
      data: { numberField: value },
      errors: null,
    });
  });
});
