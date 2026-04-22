import { describe, expect, it } from 'vitest';

import { z } from 'zod';

import { VETO_META_SENTINEL, vetoErrorMap } from './errorMap';
import { issueCodes } from './issueCodes';

/** Splits a sentinel-encoded message into its plain text + parsed meta. */
const decode = (raw: string | { message: string } | undefined) => {
  if (typeof raw !== 'string') {
    throw new Error('expected error map to return a string');
  }
  const sentinelIndex = raw.indexOf(VETO_META_SENTINEL);
  if (sentinelIndex === -1) {
    return { message: raw, meta: undefined };
  }
  return {
    message: raw.slice(0, sentinelIndex),
    meta: JSON.parse(raw.slice(sentinelIndex + VETO_META_SENTINEL.length)) as
      | Record<string, unknown>
      | undefined,
  };
};

describe('vetoErrorMap', () => {
  describe('invalid_type', () => {
    it('encodes "Field is required" with received: "null" for null input', () => {
      const result = vetoErrorMap({
        code: 'invalid_type',
        input: null,
        path: [],
        expected: 'string',
      });
      expect(decode(result)).toEqual({
        message: 'Field is required',
        meta: { received: 'null' },
      });
    });

    it('encodes "Field is required" with received: "undefined" for undefined input', () => {
      const result = vetoErrorMap({
        code: 'invalid_type',
        input: undefined,
        path: [],
        expected: 'string',
      });
      expect(decode(result)).toEqual({
        message: 'Field is required',
        meta: { received: 'undefined' },
      });
    });

    it('returns undefined for type mismatches with non-null/undefined input', () => {
      const result = vetoErrorMap({
        code: 'invalid_type',
        input: 42,
        path: [],
        expected: 'string',
      });
      expect(result).toBeUndefined();
    });

    it('treats arrays as their own received type, not "object"', () => {
      const result = vetoErrorMap({
        code: 'invalid_type',
        input: [],
        path: [],
        expected: 'object',
      });
      // Arrays are not null/undefined → default Zod message flows.
      expect(result).toBeUndefined();
    });
  });

  describe('invalid_union (discriminated)', () => {
    it('returns undefined when the issue carries no discriminator', () => {
      const result = vetoErrorMap({
        code: 'invalid_union',
        input: {},
        path: [],
        errors: [],
      });
      expect(result).toBeUndefined();
    });

    it('encodes "Field is required" with options when the discriminator is missing', () => {
      const inst = {
        def: {
          options: [
            { def: { shape: { mode: { def: { values: ['STRING'] } } } } },
            { def: { shape: { mode: { def: { values: ['NUMBER'] } } } } },
          ],
        },
      };
      const result = vetoErrorMap({
        code: 'invalid_union',
        input: {},
        path: [],
        discriminator: 'mode',
        inst,
        errors: [],
      });
      expect(decode(result)).toEqual({
        message: 'Field is required',
        meta: { received: 'undefined', options: ['STRING', 'NUMBER'] },
      });
    });

    it('returns undefined when the discriminator is present but invalid', () => {
      const inst = {
        def: {
          options: [
            { def: { shape: { mode: { def: { values: ['STRING'] } } } } },
          ],
        },
      };
      const result = vetoErrorMap({
        code: 'invalid_union',
        input: { mode: 'unknown' },
        path: [],
        discriminator: 'mode',
        inst,
        errors: [],
      });
      expect(result).toBeUndefined();
    });

    it('omits the options field when no literal values can be collected', () => {
      const result = vetoErrorMap({
        code: 'invalid_union',
        input: {},
        path: [],
        discriminator: 'mode',
        inst: { def: { options: [] } },
        errors: [],
      });
      expect(decode(result)).toEqual({
        message: 'Field is required',
        meta: { received: 'undefined' },
      });
    });
  });

  describe('invalid_value', () => {
    it('encodes "Field is required" when the input is undefined', () => {
      const result = vetoErrorMap({
        code: 'invalid_value',
        input: undefined,
        path: [],
        values: ['ONE', 'TWO'],
      });
      expect(decode(result)).toEqual({
        message: 'Field is required',
        meta: { received: 'undefined' },
      });
    });

    it('encodes a literal-style message for single-value sets', () => {
      const result = vetoErrorMap({
        code: 'invalid_value',
        input: 'OTHER',
        path: [],
        values: ['ONLY'],
      });
      expect(decode(result)).toEqual({
        message: "Invalid literal value, expected 'ONLY'",
        meta: { input: 'OTHER' },
      });
    });

    it('encodes an enum-style message for multi-value sets', () => {
      const result = vetoErrorMap({
        code: 'invalid_value',
        input: 'THREE',
        path: [],
        values: ['ONE', 'TWO'],
      });
      expect(decode(result)).toEqual({
        message: "Invalid enum value. Expected 'ONE' | 'TWO', received 'THREE'",
        meta: { input: 'THREE' },
      });
    });

    it('formats non-string literals without quotes', () => {
      const result = vetoErrorMap({
        code: 'invalid_value',
        input: 4,
        path: [],
        values: [1, 2, 3],
      });
      expect(decode(result)).toEqual({
        message: 'Invalid enum value. Expected 1 | 2 | 3, received 4',
        meta: { input: 4 },
      });
    });
  });

  describe('passthrough', () => {
    it('returns undefined for codes it does not handle', () => {
      const result = vetoErrorMap({
        code: 'too_small',
        input: '',
        path: [],
        minimum: 1,
      });
      expect(result).toBeUndefined();
    });
  });
});

describe('z.config integration', () => {
  // Importing './errorMap' (above) registers the global error map. These
  // checks verify it actually flows through z.safeParse.
  it('produces a sentinel-encoded message via real Zod parsing', () => {
    const result = z.string().safeParse(undefined);
    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    const decoded = decode(result.error.issues[0]?.message);
    expect(decoded).toEqual({
      message: 'Field is required',
      meta: { received: 'undefined' },
    });
  });

  it('encodes the original input value for enum mismatches', () => {
    const result = z.enum(['ONE', 'TWO']).safeParse('THREE');
    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    const decoded = decode(result.error.issues[0]?.message);
    expect(decoded).toEqual({
      message: "Invalid enum value. Expected 'ONE' | 'TWO', received 'THREE'",
      meta: { input: 'THREE' },
    });
  });

  it('preserves the issue code for codes the error map ignores', () => {
    const result = z.string().min(5).safeParse('hi');
    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }
    const issue = result.error.issues[0] as { code: string; message: string };
    expect(issue.code).toBe(issueCodes.too_small);
    // No sentinel — message flows from Zod's default.
    expect(issue.message).not.toContain(VETO_META_SENTINEL);
  });
});
