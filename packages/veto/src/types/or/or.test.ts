import type { Output } from 'src';

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { literal, number, or, string } from 'src';

describe('type inference', () => {
  it('exposes union typing for two branches', () => {
    const schema = or(literal('A'), number());
    expect(schema.safeParse('A').success).toBe(true);

    expectTypeOf<Output<typeof schema>>().toEqualTypeOf<'A' | number>();
  });

  it('exposes union typing for multiple branches', () => {
    const schema = or(literal('A'), literal('B'), number().min(10), {
      error: 'Value must satisfy at least one allowed shape',
    });
    expect(schema.safeParse('B').success).toBe(true);

    expectTypeOf<Output<typeof schema>>().toEqualTypeOf<'A' | 'B' | number>();
  });
});

describe('without error option', () => {
  it('passes when at least one branch validates', () => {
    const schema = {
      value: or(literal('A'), string().regex(/^B\d+$/)),
    };

    const result = veto(schema).validate({ value: 'A' });
    expect(result).toMatchObject({
      success: true,
      errors: null,
    });
  });

  it('supports more than two branches', () => {
    const schema = {
      value: or(literal('A'), literal('B'), number().min(10)),
    };

    const result = veto(schema).validate({ value: 'B' });
    expect(result).toMatchObject({
      success: true,
      errors: null,
    });
  });

  it('matches native union behavior on failure', () => {
    const valueSchema = or(string().min(3), number().min(10));
    const nativeValueSchema = string().min(3).or(number().min(10));

    const result = veto({ value: valueSchema }).validate({ value: 2 });
    const nativeResult = veto({ value: nativeValueSchema }).validate({
      value: 2,
    });

    expect(result).toEqual(nativeResult);
  });
});

describe('with string error option', () => {
  it('returns a single custom issue on failure', () => {
    const schema = {
      value: or(string().min(3), number().min(10), {
        error: 'Value must satisfy at least one allowed shape',
      }),
    };

    const result = veto(schema).validate({ value: 2 });
    expect(result).toMatchObject({
      success: false,
      data: null,
      errors: {
        value: [
          {
            code: 'custom',
            message: 'Value must satisfy at least one allowed shape',
          },
        ],
      },
    });
  });

  it('supports more than two branches', () => {
    const schema = {
      value: or(literal('A'), number().min(10), string().regex(/^B\d+$/), {
        error: 'Value must satisfy at least one allowed shape',
      }),
    };

    const result = veto(schema).validate({ value: false });
    expect(result).toMatchObject({
      success: false,
      data: null,
      errors: {
        value: [
          {
            code: 'custom',
            message: 'Value must satisfy at least one allowed shape',
          },
        ],
      },
    });
  });
});

describe('with error callback option', () => {
  it('branches the message on the input value', () => {
    const schema = {
      value: or(string().min(3), number().min(10), {
        error: (value) => {
          if (value === undefined || value === null || value === '') {
            return 'Field is required';
          }
          return 'Value must match the expected format';
        },
      }),
    };

    const requiredResult = veto(schema).validate({ value: undefined });
    expect(requiredResult).toMatchObject({
      success: false,
      errors: {
        value: [{ code: 'custom', message: 'Field is required' }],
      },
    });

    const formatResult = veto(schema).validate({ value: 2 });
    expect(formatResult).toMatchObject({
      success: false,
      errors: {
        value: [
          { code: 'custom', message: 'Value must match the expected format' },
        ],
      },
    });
  });

  it('falls back to native union errors when the callback returns undefined', () => {
    const callbackSchema = {
      value: or(string().min(3), number().min(10), {
        error: () => undefined,
      }),
    };
    const nativeSchema = { value: or(string().min(3), number().min(10)) };

    const callbackResult = veto(callbackSchema).validate({ value: 2 });
    const nativeResult = veto(nativeSchema).validate({ value: 2 });

    expect(callbackResult.success).toBe(false);
    expect(nativeResult.success).toBe(false);
    expect(callbackResult.errors?.value).toHaveLength(
      nativeResult.errors?.value?.length ?? 0,
    );
  });
});
