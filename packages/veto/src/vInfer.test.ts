/* eslint-disable vitest/expect-expect */

import type { VetoTypeAny } from './types';
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
  string,
} from 'src';

it('correctly infers primitive types from raw shapes', () => {
  const rawShape = {
    string: string(),
    number: number(),
    boolean: boolean(),
  };

  type Result = vInfer<typeof rawShape>;

  expectTypeOf<Result>().toMatchTypeOf<{
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

  expectTypeOf<Result>().toMatchTypeOf<{
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
  }) as VetoTypeAny;

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toMatchTypeOf<{
    id: string;
    count: number;
  }>();
});

it('correctly infers union types', () => {
  const schema = object({
    status: literal('active').or(literal('inactive')),
    data: string().or(number()),
  }) as VetoTypeAny;

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toMatchTypeOf<{
    status: 'active' | 'inactive';
    data: string | number;
  }>();
});

it('correctly infers array types', () => {
  const schema = object({
    items: array(string()),
    matrix: array(array(number())),
  }) as VetoTypeAny;

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toMatchTypeOf<{
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
    nullish: number | null | undefined;
  }

  // Bidirectional type checking to ensure exact match
  expectTypeOf<Result>().toEqualTypeOf<Expected>();
  expectTypeOf<Expected>().toEqualTypeOf<Result>();
});

it('correctly infers record types', () => {
  const schema = object({
    metadata: record(string()),
    counts: record(number()),
  }) as VetoTypeAny;

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toMatchTypeOf<{
    metadata: Record<string, string>;
    counts: Record<string, number>;
  }>();
});

it('correctly infers discriminated union types', () => {
  const schema = discriminatedUnion('type', [
    object({ type: literal('user'), id: string() }),
    object({ type: literal('admin'), id: string(), role: string() }),
  ]) as VetoTypeAny;

  type Result = vInfer<typeof schema>;

  expectTypeOf<Result>().toMatchTypeOf<
    { type: 'user'; id: string } | { type: 'admin'; id: string; role: string }
  >();
});

it('returns never for invalid schemas', () => {
  // @ts-expect-error Testing invalid schema
  type Result = vInfer<string>;

  expectTypeOf<Result>().toBeNever();
});

it('correctly infers intersection types', () => {
  const baseSchema = object({ id: string() });
  const extendedSchema = baseSchema.extend({
    name: string(),
  }) as VetoTypeAny;

  type Result = vInfer<typeof extendedSchema>;

  expectTypeOf<Result>().toMatchTypeOf<{
    id: string;
    name: string;
  }>();
});
