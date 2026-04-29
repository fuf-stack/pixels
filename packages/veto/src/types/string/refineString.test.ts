/* eslint-disable vitest/expect-expect */
import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { refineString, string } from 'src';

describe('blacklist', () => {
  it('should reject exact matches', () => {
    const schema = {
      field: refineString(string())({
        blacklist: { patterns: ['invalid'] },
      }),
    };
    const result = veto(schema).validate({ field: 'invalid' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: "Value 'invalid' is blacklisted",
          },
        ],
      },
    });
  });

  it('should reject wildcard patterns', () => {
    const schema = {
      field: refineString(string())({
        blacklist: { patterns: ['test*'] },
      }),
    };
    const result = veto(schema).validate({ field: 'testing' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: "Value 'testing' is blacklisted",
          },
        ],
      },
    });
  });

  it('should use custom error message', () => {
    const schema = {
      field: refineString(string())({
        blacklist: {
          patterns: ['bad*'],
          message: (val) => `Custom: ${val}`,
        },
      }),
    };
    const result = veto(schema).validate({ field: 'badword' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: 'Custom: badword',
          },
        ],
      },
    });
  });
});

describe('custom', () => {
  it('should apply custom validation first', () => {
    const schema = {
      field: refineString(string())({
        custom: (_val, ctx) => {
          ctx.addIssue({ code: 'custom', message: 'Custom error first' });
        },
        blacklist: { patterns: ['test'] },
      }),
    };
    const result = veto(schema).validate({ field: 'test' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: 'Custom error first',
          },
          {
            code: 'custom',
            message: "Value 'test' is blacklisted",
          },
        ],
      },
    });
  });
});

describe('noConsecutiveCharacters', () => {
  it('should reject repeated characters', () => {
    const schema = {
      field: refineString(string())({
        noConsecutiveCharacters: { characters: ['!', '@'] },
      }),
    };
    const result = veto(schema).validate({ field: 'hello!!' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: "Character '!' cannot appear consecutively",
          },
        ],
      },
    });
  });

  it('should allow non-consecutive special chars', () => {
    const schema = {
      field: refineString(string())({
        noConsecutiveCharacters: { characters: ['!', '@'] },
      }),
    };
    const result = veto(schema).validate({ field: 'hello!world@' });
    expect(result).toMatchObject({
      success: true,
    });
  });

  it('should use custom error message', () => {
    const schema = {
      field: refineString(string())({
        noConsecutiveCharacters: {
          characters: ['!', '@'],
          message: (char) => `No double ${char} allowed`,
        },
      }),
    };
    const result = veto(schema).validate({ field: 'hello!!' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: 'No double ! allowed',
          },
        ],
      },
    });
  });
});

describe('optional strings', () => {
  it('should accept undefined for optional fields', () => {
    const schema = {
      field: refineString(string().optional())({
        blacklist: { patterns: ['invalid'] },
        noConsecutiveCharacters: { characters: ['!'] },
      }),
    };
    const result = veto(schema).validate({});
    expect(result).toMatchObject({
      success: true,
    });
  });

  it('should still validate present values in optional fields', () => {
    const schema = {
      field: refineString(string().optional())({
        blacklist: { patterns: ['invalid'] },
      }),
    };
    const result = veto(schema).validate({ field: 'invalid' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: "Value 'invalid' is blacklisted",
          },
        ],
      },
    });
  });

  it('should run all refinements on present values in optional fields', () => {
    const schema = {
      field: refineString(string().optional())({
        custom: (val, ctx) => {
          ctx.addIssue({ code: 'custom', message: 'Custom check failed' });
        },
        blacklist: { patterns: ['test*'] },
        noConsecutiveCharacters: { characters: ['!'] },
      }),
    };
    const result = veto(schema).validate({ field: 'test!!' });
    expect(result).toMatchObject({
      success: false,
      errors: {
        field: [
          {
            code: 'custom',
            message: 'Custom check failed',
          },
          {
            code: 'custom',
            message: "Value 'test!!' is blacklisted",
          },
          {
            code: 'custom',
            message: "Character '!' cannot appear consecutively",
          },
        ],
      },
    });
  });
});

describe('type behavior', () => {
  it('preserves required schema type at compile time', () => {
    const refined = refineString(string())({
      custom: () => {},
    });
    expectTypeOf(refined).toEqualTypeOf<ReturnType<typeof string>>();
  });

  it('preserves optional schema type at compile time', () => {
    const refined = refineString(string().optional())({
      custom: () => {},
    });
    expectTypeOf(refined).toEqualTypeOf<
      ReturnType<ReturnType<typeof string>['optional']>
    >();
  });

  it('keeps runtime string schema methods available after refine', () => {
    const refined = refineString(string())({
      custom: () => {},
    });

    const withMax = (refined as unknown as ReturnType<typeof string>).max(64);
    expectTypeOf(withMax.parse('hello')).toEqualTypeOf<string>();
    expect(typeof (refined as { max?: unknown }).max).toBe('function');
  });

  it('keeps runtime optional schema methods available after refine', () => {
    const refined = refineString(string().optional())({
      custom: () => {},
    });

    const unwrapped = (
      refined as unknown as ReturnType<ReturnType<typeof string>['optional']>
    ).unwrap();
    expectTypeOf(unwrapped.parse('hello')).toEqualTypeOf<string>();
    expectTypeOf(refined.parse(undefined)).toEqualTypeOf<string | undefined>();
    expect(typeof (refined as { unwrap?: unknown }).unwrap).toBe('function');
  });
});
