import { describe, expect, it } from 'vitest';

import { VETO_META_SENTINEL } from './errorMap';
import { normalizeIssue } from './normalizeIssue';

/** Helper that wraps a clean message + JSON-encoded meta in the sentinel. */
const withMeta = (message: string, meta: Record<string, unknown>) =>
  `${message}${VETO_META_SENTINEL}${JSON.stringify(meta)}`;

describe('normalizeIssue', () => {
  describe('extractMessageMeta (sentinel handling)', () => {
    it('returns the message unchanged when the sentinel is absent', () => {
      const result = normalizeIssue({
        code: 'custom',
        message: 'Plain message',
      });
      expect(result).toEqual({
        code: 'custom',
        message: 'Plain message',
      });
    });

    it('strips the sentinel and lifts received/options onto the issue', () => {
      const result = normalizeIssue({
        code: 'custom',
        message: withMeta('Field is required', {
          received: 'undefined',
          options: ['A', 'B'],
        }),
      });
      expect(result).toEqual({
        code: 'custom',
        message: 'Field is required',
        received: 'undefined',
        options: ['A', 'B'],
      });
    });

    it('drops the message when it is not a string', () => {
      const result = normalizeIssue({
        code: 'custom',
        message: 42 as unknown as string,
      });
      expect(result.message).toBeUndefined();
    });

    it('keeps the cleaned message but drops meta when JSON is invalid', () => {
      const result = normalizeIssue({
        code: 'custom',
        message: `Broken${VETO_META_SENTINEL}{not-json`,
      });
      expect(result).toEqual({
        code: 'custom',
        message: 'Broken',
      });
    });

    it('keeps the cleaned message but drops meta when JSON is not an object', () => {
      const result = normalizeIssue({
        code: 'custom',
        message: `Broken${VETO_META_SENTINEL}["array","payload"]`,
      });
      expect(result).toEqual({
        code: 'custom',
        message: 'Broken',
      });
    });
  });

  describe('invalid_type', () => {
    it('rewrites the default Zod v4 message to the v0 wording', () => {
      const result = normalizeIssue({
        code: 'invalid_type',
        expected: 'string',
        message: 'Invalid input: expected string, received number',
        path: ['field'],
      });
      expect(result).toEqual({
        code: 'invalid_type',
        expected: 'string',
        message: 'Expected string, received number',
        received: 'number',
        path: ['field'],
      });
    });

    it('lifts received from sentinel meta and surfaces "Field is required"', () => {
      const result = normalizeIssue({
        code: 'invalid_type',
        expected: 'string',
        message: withMeta('Field is required', { received: 'null' }),
      });
      expect(result).toEqual({
        code: 'invalid_type',
        expected: 'string',
        message: 'Field is required',
        received: 'null',
      });
    });

    it('falls back to "undefined" when no received info is available', () => {
      const result = normalizeIssue({
        code: 'invalid_type',
        expected: 'string',
        message: 'Some non-default message',
      });
      expect(result.received).toBe('undefined');
      // Non-"Invalid input" messages are preserved as-is.
      expect(result.message).toBe('Some non-default message');
    });

    it('preserves a non-default message even when expected is set', () => {
      const result = normalizeIssue({
        code: 'invalid_type',
        expected: 'string',
        message: 'My custom error',
        received: 'number',
      });
      expect(result.message).toBe('My custom error');
    });
  });

  describe('too_small / too_big', () => {
    it('rewrites string min from a built-in validator and adds exact: false', () => {
      const result = normalizeIssue({
        code: 'too_small',
        origin: 'string',
        minimum: 3,
        inclusive: true,
        message: 'Too small: expected string to have >=3 characters',
      });
      expect(result).toEqual({
        code: 'too_small',
        type: 'string',
        minimum: 3,
        inclusive: true,
        exact: false,
        message: 'String must contain at least 3 character(s)',
      });
    });

    it('rewrites array max from a built-in validator and adds exact: false', () => {
      const result = normalizeIssue({
        code: 'too_big',
        origin: 'array',
        maximum: 5,
        inclusive: true,
        message: 'Too big: expected array to have <=5 items',
      });
      expect(result).toEqual({
        code: 'too_big',
        type: 'array',
        maximum: 5,
        inclusive: true,
        exact: false,
        message: 'Array must contain at most 5 element(s)',
      });
    });

    it('preserves a custom message from a built-in validator', () => {
      const result = normalizeIssue({
        code: 'too_small',
        origin: 'string',
        minimum: 1,
        inclusive: true,
        message: 'My custom min error',
      });
      expect(result.message).toBe('My custom min error');
      expect(result.exact).toBe(false);
    });

    it('does not add exact or rewrite the message for ctx.addIssue (no origin)', () => {
      const result = normalizeIssue({
        code: 'too_small',
        type: 'array',
        minimum: 2,
        inclusive: true,
        message: 'Array must have at least 2 elements',
      });
      expect(result).toEqual({
        code: 'too_small',
        type: 'array',
        minimum: 2,
        inclusive: true,
        message: 'Array must have at least 2 elements',
      });
      expect(result).not.toHaveProperty('exact');
    });

    it('returns the issue unchanged when origin is neither string nor array', () => {
      const result = normalizeIssue({
        code: 'too_small',
        origin: 'number',
        minimum: 10,
        inclusive: true,
        message: 'Too small: expected number to be >=10',
      });
      expect(result).toEqual({
        code: 'too_small',
        origin: 'number',
        minimum: 10,
        inclusive: true,
        message: 'Too small: expected number to be >=10',
      });
    });

    it('skips the branch when minimum/maximum is missing', () => {
      const result = normalizeIssue({
        code: 'too_small',
        origin: 'string',
        message: 'Too small',
      });
      // Branch guard requires a numeric `minimum`; otherwise the issue is
      // returned untouched.
      expect(result).toEqual({
        code: 'too_small',
        origin: 'string',
        message: 'Too small',
      });
    });
  });

  describe('unrecognized_keys', () => {
    it('formats the keys list into a v0-style message', () => {
      const result = normalizeIssue({
        code: 'unrecognized_keys',
        keys: ['extra', 'unknown'],
        message: 'Unrecognized key: "extra"',
      });
      expect(result.message).toBe(
        "Unrecognized key(s) in object: 'extra', 'unknown'",
      );
      expect(result.keys).toEqual(['extra', 'unknown']);
    });
  });

  describe('invalid_value', () => {
    it('rewrites a single-value invalid_value to invalid_literal', () => {
      const result = normalizeIssue({
        code: 'invalid_value',
        values: ['EXACT'],
      });
      expect(result).toEqual({
        code: 'invalid_literal',
        expected: 'EXACT',
        message: 'Invalid literal value, expected EXACT',
      });
      expect(result).not.toHaveProperty('values');
    });

    it('rewrites a multi-value invalid_value to invalid_enum_value', () => {
      const result = normalizeIssue({
        code: 'invalid_value',
        values: ['ONE', 'TWO'],
        message: withMeta(
          "Invalid enum value. Expected 'ONE' | 'TWO', received 'THREE'",
          { input: 'THREE' },
        ),
      });
      expect(result).toEqual({
        code: 'invalid_enum_value',
        message: "Invalid enum value. Expected 'ONE' | 'TWO', received 'THREE'",
        options: ['ONE', 'TWO'],
        received: 'THREE',
      });
    });

    it('builds a fallback enum message when no message was encoded', () => {
      const result = normalizeIssue({
        code: 'invalid_value',
        values: [1, 2, 3],
        message: '',
      });
      expect(result.code).toBe('invalid_enum_value');
      expect(result.options).toEqual([1, 2, 3]);
      expect(result.message).toBe('Invalid enum value. Expected 1 | 2 | 3');
    });

    it('preserves an existing message from the sentinel for literals', () => {
      const result = normalizeIssue({
        code: 'invalid_value',
        values: ['ONLY'],
        message: withMeta('My custom literal message', {}),
      });
      expect(result.code).toBe('invalid_literal');
      expect(result.expected).toBe('ONLY');
      expect(result.message).toBe('My custom literal message');
    });
  });

  describe('invalid_union', () => {
    it('trims noisy v4 fields when the message is "Field is required"', () => {
      const result = normalizeIssue({
        code: 'invalid_union',
        message: withMeta('Field is required', {
          received: 'undefined',
          options: ['STRING', 'NUMBER'],
        }),
        discriminator: 'mode',
        errors: [[]],
        note: 'No matching discriminator',
      });
      expect(result).toEqual({
        code: 'invalid_union',
        message: 'Field is required',
        received: 'undefined',
        options: ['STRING', 'NUMBER'],
      });
    });

    it('leaves regular invalid_union issues untouched', () => {
      const result = normalizeIssue({
        code: 'invalid_union',
        message: 'Invalid input',
        errors: [[{ code: 'invalid_type' }]],
      });
      expect(result).toEqual({
        code: 'invalid_union',
        message: 'Invalid input',
        errors: [[{ code: 'invalid_type' }]],
      });
    });
  });

  describe('passthrough', () => {
    it('returns issues with codes it does not handle unchanged (besides sentinel stripping)', () => {
      const result = normalizeIssue({
        code: 'custom',
        message: 'Custom rule failed',
        path: ['field'],
        params: { foo: 'bar' },
      });
      expect(result).toEqual({
        code: 'custom',
        message: 'Custom rule failed',
        path: ['field'],
        params: { foo: 'bar' },
      });
    });
  });
});
