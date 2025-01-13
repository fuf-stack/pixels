import type { SzType } from 'zodex';

import { describe, expect, it } from 'vitest';

import { z } from 'zod';

import { checkSerializedSchemaPath } from './serialize';

describe('checkSerializedSchemaPath', () => {
  it('handles basic object schemas', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const isStringType = (type: SzType | null) => type?.type === 'string';

    expect(checkSerializedSchemaPath(schema, isStringType, ['name'])).toBe(
      true,
    );
    expect(checkSerializedSchemaPath(schema, isStringType, ['age'])).toBe(
      false,
    );
  });

  it('handles nested object schemas', () => {
    const schema = z.object({
      user: z.object({
        details: z.object({
          email: z.string(),
        }),
      }),
    });

    const isStringType = (type: SzType | null) => type?.type === 'string';

    expect(
      checkSerializedSchemaPath(schema, isStringType, [
        'user',
        'details',
        'email',
      ]),
    ).toBe(true);
    expect(
      checkSerializedSchemaPath(schema, isStringType, ['user', 'details']),
    ).toBe(false);
  });

  it('handles array schemas', () => {
    const schema = z.object({
      items: z.array(z.string()),
      matrix: z.array(z.array(z.number())),
    });

    const isStringType = (type: SzType | null) => type?.type === 'string';
    const isNumberType = (type: SzType | null) => type?.type === 'number';

    expect(checkSerializedSchemaPath(schema, isStringType, ['items', 0])).toBe(
      true,
    );
    expect(
      checkSerializedSchemaPath(schema, isNumberType, ['matrix', 0, 0]),
    ).toBe(true);
  });

  it('handles discriminated union schemas', () => {
    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('user'), name: z.string() }),
      z.object({ type: z.literal('admin'), role: z.string() }),
    ]);

    const isStringType = (type: SzType | null) => type?.type === 'string';

    expect(checkSerializedSchemaPath(schema, isStringType, ['name'])).toBe(
      true,
    );
    expect(checkSerializedSchemaPath(schema, isStringType, ['role'])).toBe(
      true,
    );
  });

  it('handles intersection schemas', () => {
    const baseSchema = z.object({ id: z.string() });
    const extendedSchema = baseSchema.extend({ name: z.string() });

    const isStringType = (type: SzType | null) => type?.type === 'string';

    expect(
      checkSerializedSchemaPath(extendedSchema, isStringType, ['id']),
    ).toBe(true);
    expect(
      checkSerializedSchemaPath(extendedSchema, isStringType, ['name']),
    ).toBe(true);
  });

  it('handles record schemas', () => {
    const schema = z.object({
      metadata: z.record(z.string()),
    });

    const isStringType = (type: SzType | null) => type?.type === 'string';

    expect(
      checkSerializedSchemaPath(schema, isStringType, ['metadata', 'anyKey']),
    ).toBe(true);
  });

  it('handles invalid paths', () => {
    const schema = z.object({
      name: z.string(),
    });

    // Helper to show the actual result for debugging
    const debugPath = (path: (string | number)[]) => {
      const isStringType = (type: SzType | null) => {
        return type?.type === 'string';
      };
      return checkSerializedSchemaPath(schema, isStringType, path);
    };

    // Test cases with debug output
    const nonexistentResult = debugPath(['nonexistent']);
    const invalidNestedResult = debugPath(['name', 'invalid']);

    expect(nonexistentResult).toBe(false);
    expect(invalidNestedResult).toBe(false);
  });

  // Add more test cases to verify path traversal behavior
  it('correctly identifies valid and invalid paths', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
      }),
      tags: z.array(z.string()),
    });

    const isStringType = (type: SzType | null) => type?.type === 'string';

    // Valid paths
    expect(
      checkSerializedSchemaPath(schema, isStringType, ['user', 'name']),
    ).toBe(true);
    expect(checkSerializedSchemaPath(schema, isStringType, ['tags', 0])).toBe(
      true,
    );

    // Invalid paths
    expect(
      checkSerializedSchemaPath(schema, isStringType, ['user', 'age']),
    ).toBe(false);
    expect(
      checkSerializedSchemaPath(schema, isStringType, ['nonexistent']),
    ).toBe(false);
    expect(
      checkSerializedSchemaPath(schema, isStringType, [
        'user',
        'name',
        'extra',
      ]),
    ).toBe(false);
  });

  it('handles root schema checks', () => {
    const schema = z.object({
      name: z.string(),
    });

    const isObjectType = (type: SzType | null) => type?.type === 'object';

    expect(checkSerializedSchemaPath(schema, isObjectType)).toBe(true);
  });

  it('handles null schema input', () => {
    const isAnyType = (_type: SzType | null) => true;
    // @ts-expect-error Testing null input
    expect(checkSerializedSchemaPath(null, isAnyType)).toBe(false);
  });

  it('handles complex nested structures', () => {
    const schema = z.object({
      users: z.array(
        z.object({
          details: z.object({
            contacts: z.record(
              z.object({
                value: z.string(),
              }),
            ),
          }),
        }),
      ),
    });

    const isStringType = (type: SzType | null) => type?.type === 'string';

    expect(
      checkSerializedSchemaPath(schema, isStringType, [
        'users',
        0,
        'details',
        'contacts',
        'email',
        'value',
      ]),
    ).toBe(true);
  });
});
