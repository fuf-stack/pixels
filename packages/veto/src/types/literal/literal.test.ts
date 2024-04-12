import { expect, it } from 'vitest';

import v, { literal } from 'src';

it('rejects non-Literal input', () => {
  const schema = { literalField: literal(4) };
  const result = v(schema).validate({ literalField: '4' });
  expect(result).toMatchObject({
    success: false,
    errors: {
      _errors: [],
      literalField: [
        {
          code: 'invalid_literal',
          expected: 4,
          message: 'Invalid literal value, expected 4',
        },
      ],
    },
  });
});

it('accepts Literal input', () => {
  const schema = { literalField: literal(true) };
  const result = v(schema).validate({ literalField: true });
  expect(result).toMatchObject({
    success: true,
    data: { literalField: true },
  });
});

// TODO: more tests?
