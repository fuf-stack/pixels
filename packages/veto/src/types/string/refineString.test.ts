import { describe, expect, it } from 'vitest';

import v, { refineString, string } from 'src';

describe('blacklist', () => {
  it('should reject exact matches', () => {
    const schema = {
      field: refineString(string())({
        blacklist: { patterns: ['invalid'] },
      }),
    };
    const result = v(schema).validate({ field: 'invalid' });
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
    const result = v(schema).validate({ field: 'testing' });
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
    const result = v(schema).validate({ field: 'badword' });
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
    const result = v(schema).validate({ field: 'test' });
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
    const result = v(schema).validate({ field: 'hello!!' });
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
    const result = v(schema).validate({ field: 'hello!world@' });
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
    const result = v(schema).validate({ field: 'hello!!' });
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
    const result = v(schema).validate({});
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
    const result = v(schema).validate({ field: 'invalid' });
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
    const result = v(schema).validate({ field: 'test!!' });
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
