import type { SerializedSchema, SerializedSchemaPathType } from './serialize';

import { describe, expect, it, vi } from 'vitest';

import { z } from 'zod';

import { checkSerializedSchemaPath, serializeSchema } from './serialize';

const isType =
  (expectedType: string) =>
  (type: SerializedSchema | null): boolean =>
    type?.type === expectedType;

describe('checkSerializedSchemaPath', () => {
  it('handles basic object schemas', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const isStringType = isType('string');

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

    const isStringType = isType('string');

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

    const isStringType = isType('string');
    const isNumberType = isType('number');

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

    const isStringType = isType('string');

    expect(checkSerializedSchemaPath(schema, isStringType, ['name'])).toBe(
      true,
    );
    expect(checkSerializedSchemaPath(schema, isStringType, ['role'])).toBe(
      true,
    );
  });

  it('handles intersection schemas', () => {
    const baseSchema = z.object({ id: z.string() });
    const extendedSchema = z.object({ ...baseSchema.shape, name: z.string() });

    const isStringType = isType('string');

    expect(
      checkSerializedSchemaPath(extendedSchema, isStringType, ['id']),
    ).toBe(true);
    expect(
      checkSerializedSchemaPath(extendedSchema, isStringType, ['name']),
    ).toBe(true);
  });

  it('handles record schemas', () => {
    const schema = z.object({
      metadata: z.record(z.string(), z.string()),
    });

    const isStringType = isType('string');

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
      const isStringType = isType('string');
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

    const isStringType = isType('string');

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

    const isObjectType = isType('object');

    expect(checkSerializedSchemaPath(schema, isObjectType)).toBe(true);
  });

  it('surfaces optional object fields via traversal metadata', () => {
    const schema = z.object({
      optionalName: z.string().optional(),
      requiredName: z.string(),
    });

    const isOptional = (type: SerializedSchemaPathType | null) =>
      Boolean(type?.isOptional);

    expect(
      checkSerializedSchemaPath(schema, isOptional, ['optionalName']),
    ).toBe(true);
    expect(
      checkSerializedSchemaPath(schema, isOptional, ['requiredName']),
    ).toBe(false);
  });

  it('does not treat nested required fields as optional via parent wrappers', () => {
    const schema = z.object({
      maybeUser: z
        .object({
          profile: z.object({
            nickname: z.string(),
          }),
        })
        .nullish(),
    });

    const isOptionalOrNullable = (type: SerializedSchemaPathType | null) =>
      Boolean((type?.isOptional ?? false) || (type?.isNullable ?? false));

    expect(
      checkSerializedSchemaPath(schema, isOptionalOrNullable, [
        'maybeUser',
        'profile',
        'nickname',
      ]),
    ).toBe(false);
  });

  it('handles null schema input', () => {
    const isAnyType = (_type: SerializedSchema | null) => true;
    // @ts-expect-error Testing null input
    expect(checkSerializedSchemaPath(null, isAnyType)).toBe(false);
  });

  it('handles complex nested structures', () => {
    const schema = z.object({
      users: z.array(
        z.object({
          details: z.object({
            contacts: z.record(
              z.string(),
              z.object({
                value: z.string(),
              }),
            ),
          }),
        }),
      ),
    });

    const isStringType = isType('string');

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

  it('handles intersection schemas created with z.intersection', () => {
    const schema = z.intersection(
      z.object({ left: z.string() }),
      z.object({ right: z.string() }),
    );

    const isStringType = isType('string');

    expect(checkSerializedSchemaPath(schema, isStringType, ['left'])).toBe(
      true,
    );
    expect(checkSerializedSchemaPath(schema, isStringType, ['right'])).toBe(
      true,
    );
  });

  it('handles regular union schemas', () => {
    const schema = z.union([
      z.object({ username: z.string() }),
      z.object({ email: z.string() }),
    ]);
    const isStringType = isType('string');

    expect(checkSerializedSchemaPath(schema, isStringType, ['username'])).toBe(
      true,
    );
    expect(checkSerializedSchemaPath(schema, isStringType, ['email'])).toBe(
      true,
    );
  });

  it('supports array element traversal without explicit numeric index', () => {
    const schema = z.object({
      users: z.array(
        z.object({
          profile: z.object({
            name: z.string(),
          }),
        }),
      ),
    });
    const isStringType = isType('string');

    expect(
      checkSerializedSchemaPath(schema, isStringType, [
        'users',
        'profile',
        'name',
      ]),
    ).toBe(true);
  });

  it('unwraps pipe wrappers and still resolves transformed paths', () => {
    const schema = z.object({
      size: z.string().transform((value) => value.length),
    });
    const resolvesToAnySchemaNode = (type: SerializedSchemaPathType | null) =>
      type !== null;

    expect(
      checkSerializedSchemaPath(schema, resolvesToAnySchemaNode, ['size']),
    ).toBe(true);
  });

  it('handles nonoptional wrappers while traversing type paths', () => {
    const schema = z.object({
      name: z.string().optional().nonoptional(),
    });
    const isStringType = isType('string');

    expect(checkSerializedSchemaPath(schema, isStringType, ['name'])).toBe(
      true,
    );
  });

  it('returns false for truthy non-zod schema-like inputs', () => {
    const alwaysTrue = (_type: SerializedSchemaPathType | null) => true;

    expect(
      checkSerializedSchemaPath(
        // Robustness: callers might pass serialized/plain objects by mistake.
        {} as unknown as z.ZodTypeAny,
        alwaysTrue,
        ['name'],
      ),
    ).toBe(false);
  });

  it('returns false for malformed object definitions without shape objects', () => {
    const alwaysTrue = (_type: SerializedSchemaPathType | null) => true;
    const malformedObjectSchema = {
      def: { type: 'object', shape: null },
    } as unknown as z.ZodTypeAny;

    expect(
      checkSerializedSchemaPath(malformedObjectSchema, alwaysTrue, ['name']),
    ).toBe(false);
  });
});

describe('serializeSchema', () => {
  it('falls back to empty schema when zod serialization throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(serializeSchema(null as unknown as z.ZodTypeAny)).toEqual({});

    warnSpy.mockRestore();
  });
});
