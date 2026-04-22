import type { VetoSchema, VetoUnformattedError } from './types';

import { describe, expect, it } from 'vitest';

import { z } from 'zod';

import { formatError } from './formatError';

/**
 * Builds a minimal Zod-error-shaped object from a list of issues so we can
 * test the tree-building logic without going through Zod itself.
 */
const makeError = (issues: Record<string, unknown>[]): VetoUnformattedError =>
  ({ issues }) as unknown as VetoUnformattedError;

const stringSchema: VetoSchema = z.object({ field: z.string() });
const objectSchema: VetoSchema = z.object({
  field: z.object({ nested: z.string() }),
});

describe('formatError', () => {
  it('returns an empty error tree when there are no issues', () => {
    expect(formatError(makeError([]), stringSchema)).toEqual({ _errors: [] });
  });

  it('places a single root-level issue under _errors', () => {
    const result = formatError(
      makeError([
        {
          code: 'custom',
          message: 'Bad shape',
          path: [],
        },
      ]),
      stringSchema,
    );
    expect(result).toEqual({
      _errors: [{ code: 'custom', message: 'Bad shape' }],
    });
  });

  it('nests issues by path', () => {
    const result = formatError(
      makeError([
        {
          code: 'invalid_type',
          message: 'Invalid input: expected string, received number',
          expected: 'string',
          path: ['field'],
        },
      ]),
      stringSchema,
    );
    expect(result).toEqual({
      field: [
        {
          code: 'invalid_type',
          message: 'Expected string, received number',
          expected: 'string',
          received: 'number',
        },
      ],
    });
  });

  it('groups multiple issues under the same path', () => {
    const result = formatError(
      makeError([
        {
          code: 'custom',
          message: 'first error',
          path: ['field'],
        },
        {
          code: 'custom',
          message: 'second error',
          path: ['field'],
        },
      ]),
      stringSchema,
    );
    expect(result).toEqual({
      field: [
        { code: 'custom', message: 'first error' },
        { code: 'custom', message: 'second error' },
      ],
    });
  });

  it('orders custom issues before built-in issues at the same path', () => {
    const result = formatError(
      makeError([
        {
          code: 'too_small',
          message: 'Too small: expected string to have >=3 characters',
          minimum: 3,
          path: ['field'],
          origin: 'string',
          inclusive: true,
        },
        {
          code: 'custom',
          message: 'custom first',
          path: ['field'],
        },
      ]),
      stringSchema,
    );
    expect(result).toEqual({
      field: [
        { code: 'custom', message: 'custom first' },
        {
          code: 'too_small',
          message: 'String must contain at least 3 character(s)',
          minimum: 3,
          inclusive: true,
          type: 'string',
          exact: false,
        },
      ],
    });
  });

  it('builds nested branches for deep paths', () => {
    const result = formatError(
      makeError([
        {
          code: 'custom',
          message: 'deep error',
          path: ['field', 'nested'],
        },
      ]),
      objectSchema,
    );
    expect(result).toEqual({
      field: {
        nested: [{ code: 'custom', message: 'deep error' }],
      },
    });
  });

  it('puts errors under _errors when the path resolves to an object-like schema', () => {
    // The error sits at `field` itself (an object), so it must be wrapped in
    // _errors to coexist with potential child errors under the same key.
    const result = formatError(
      makeError([
        {
          code: 'custom',
          message: 'object-level error',
          path: ['field'],
        },
        {
          code: 'custom',
          message: 'child error',
          path: ['field', 'nested'],
        },
      ]),
      objectSchema,
    );
    expect(result).toEqual({
      field: {
        _errors: [{ code: 'custom', message: 'object-level error' }],
        nested: [{ code: 'custom', message: 'child error' }],
      },
    });
  });

  it('lifts custom-code params onto the issue and removes the params field', () => {
    const result = formatError(
      makeError([
        {
          code: 'custom',
          message: 'duplicate',
          params: { code: 'not_unique', extra: 'data' },
          path: ['field'],
        },
      ]),
      stringSchema,
    );
    expect(result).toEqual({
      field: [
        {
          code: 'not_unique',
          message: 'duplicate',
          extra: 'data',
        },
      ],
    });
    expect(result.field?.[0]).not.toHaveProperty('params');
  });

  it('strips internal fields (input, inst, _errorPath, path) from formatted issues', () => {
    const result = formatError(
      makeError([
        {
          code: 'custom',
          message: 'foo',
          path: ['field'],
          input: 'raw input',
          inst: { internal: true },
        },
      ]),
      stringSchema,
    );
    const issue = result.field?.[0] as Record<string, unknown>;
    expect(issue).not.toHaveProperty('input');
    expect(issue).not.toHaveProperty('inst');
    expect(issue).not.toHaveProperty('_errorPath');
    expect(issue).not.toHaveProperty('path');
  });
});
