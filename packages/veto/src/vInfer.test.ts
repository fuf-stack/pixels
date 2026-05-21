/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable vitest/expect-expect */

import type { vInfer } from './vInfer';

import { expectTypeOf, it } from 'vitest';

import {
  array,
  boolean,
  discriminatedUnion,
  literal,
  number,
  object,
  record,
  schemaFactory,
  string,
} from 'src';

it('correctly infers primitive types from raw shapes', () => {
  const rawShape = {
    string: string(),
    number: number(),
    boolean: boolean(),
  };

  type Result = vInfer<typeof rawShape>;

  expectTypeOf<Result>().toEqualTypeOf<{
    string: string;
    number: number;
    boolean: boolean;
  }>();
});

it('correctly infers nested objects from raw shapes', () => {
  const rawShape = {
    nested: {
      field1: string(),
      field2: number(),
    },
    array: array(string()),
  };

  type Result = vInfer<typeof rawShape>;

  expectTypeOf<Result>().toEqualTypeOf<{
    nested: {
      field1: string;
      field2: number;
    };
    array: string[];
  }>();
});

it('correctly infers types from Zod schemas', () => {
  const schema = object({
    id: string(),
    count: number(),
  });

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toEqualTypeOf<{
    id: string;
    count: number;
  }>();
});

it('correctly infers union types', () => {
  const schema = object({
    status: literal('active').or(literal('inactive')),
    data: string().or(number()),
  });

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toEqualTypeOf<{
    status: 'active' | 'inactive';
    data: string | number;
  }>();
});

it('correctly infers array types', () => {
  const schema = object({
    items: array(string()),
    matrix: array(array(number())),
  });

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toEqualTypeOf<{
    items: string[];
    matrix: number[][];
  }>();
});

it('correctly infers optional types', () => {
  const rawShape = {
    required: string(),
    optional: string().optional(),
    nullish: number().nullish(),
  };

  type Result = vInfer<typeof rawShape>;

  // Using a more precise type definition
  interface Expected {
    required: string;
    optional?: string | undefined;
    nullish?: number | null | undefined;
  }

  // Bidirectional type checking to ensure exact match.
  expectTypeOf<Result>().toEqualTypeOf<Expected>();
  expectTypeOf<Expected>().toEqualTypeOf<Result>();
});

it('correctly infers record types', () => {
  const schema = object({
    metadata: record(string()),
    counts: record(number()),
  });

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toEqualTypeOf<{
    metadata: Record<string, string>;
    counts: Record<string, number>;
  }>();
});

it('correctly infers discriminated union types', () => {
  const schema = discriminatedUnion('type', [
    object({ type: literal('user'), id: string() }),
    object({ type: literal('admin'), id: string(), role: string() }),
  ]);

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toEqualTypeOf<
    { type: 'user'; id: string } | { type: 'admin'; id: string; role: string }
  >();
});

it('returns never for invalid schemas', () => {
  type Result = vInfer<string>;

  expectTypeOf<Result>().toBeNever();
});

it('correctly infers intersection types', () => {
  const baseSchema = object({ id: string() });
  const extendedSchema = baseSchema.extend({
    name: string(),
  });

  type Result = vInfer<typeof extendedSchema>;

  expectTypeOf<Result>().toEqualTypeOf<{
    id: string;
    name: string;
  }>();
});

it('correctly infers from schemaFactory metadata (no args)', () => {
  const factory = schemaFactory(
    object({
      username: string(),
    }),
  );

  type Result = vInfer<typeof factory>;

  expectTypeOf<Result>().toEqualTypeOf<{
    username: string;
  }>();
});

it('correctly infers from schemaFactory metadata (with args)', () => {
  const factory = schemaFactory((required: boolean) =>
    object({
      name: required ? string() : string().optional(),
    }),
  );

  type Result = vInfer<typeof factory>;

  expectTypeOf<Result>().toEqualTypeOf<{ name: string | undefined }>();
});

it('reads __vetoOutput metadata directly without inspecting schema types', () => {
  // Simulate a portable factory shape with phantom output metadata. The
  // metadata is a plain TS shape, with no reference to Zod internals — this
  // is what avoids TS2742/TS2883 in consumer packages.
  type FakeFactory = {
    readonly __vetoOutput?: { id: string; count: number };
  };
  type Result = vInfer<FakeFactory>;

  expectTypeOf<Result>().toEqualTypeOf<{ id: string; count: number }>();
});

it('resolves __vetoOutput metadata to undefined when phantom is empty', () => {
  // A factory whose output metadata was never set (or was explicitly empty)
  // should resolve to `undefined`, not `never`. This protects against
  // accidental regression where the `__vetoOutput?` optional field is
  // collapsed to `never` by future refactors of `vInfer`.
  type FakeFactory = {
    readonly __vetoOutput?: undefined;
  };
  type Result = vInfer<FakeFactory>;

  expectTypeOf<Result>().toEqualTypeOf<undefined>();
});
