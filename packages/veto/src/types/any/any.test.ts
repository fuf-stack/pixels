import type { VAnySchema } from './any';

import { expect, expectTypeOf, it } from 'vitest';

import veto, { any } from 'src';

it('exposes any schema typing', () => {
  expectTypeOf(any).returns.toEqualTypeOf<VAnySchema>();
  expectTypeOf(any()).toEqualTypeOf<VAnySchema>();
  const parsed = any().parse('x');
  expectTypeOf(parsed).toMatchTypeOf<unknown>();
  expect(parsed).toBe('x');
});

[
  'a string',
  1,
  1.1,
  true,
  false,
  [],
  ['test'],
  {},
  { test: 1 },
  null,
  undefined,
].forEach((value) => {
  it(`accepts value '${JSON.stringify(value)}'`, () => {
    const schema = { anyField: any() };
    const result = veto(schema).validate({ anyField: value });
    expect(result).toMatchObject({
      success: true,
      data: { anyField: value },
      errors: null,
    });
  });
});
