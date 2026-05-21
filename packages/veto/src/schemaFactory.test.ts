/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable vitest/expect-expect */

import type { vInferFactory } from './schemaFactory';
import type { VetoTypeAny } from './types';
import type { vInfer } from './vInfer';

import { expect, expectTypeOf, it } from 'vitest';

import { schemaFactory } from './schemaFactory';
import { object } from './types/object/object';
import { string } from './types/string/string';

it('returns the original schema instance at runtime', () => {
  const schema = object({
    name: string(),
  });
  const factory = schemaFactory(schema);

  expect(factory()).toBe(schema);
  expect(factory().parse({ name: 'Ada' })).toEqual({ name: 'Ada' });
});

it('exposes a portable callable return type', () => {
  const factory = schemaFactory(
    object({
      id: string(),
    }),
  );

  expectTypeOf(factory()).toEqualTypeOf<VetoTypeAny>();
});

it('infers output type via vInferFactory', () => {
  const factory = schemaFactory(
    object({
      email: string(),
    }),
  );
  type Result = vInferFactory<typeof factory>;

  expectTypeOf<Result>().toEqualTypeOf<{ email: string }>();
});

it('works with vInfer directly on factory values', () => {
  const factory = schemaFactory(
    object({
      role: string(),
    }),
  );
  type Result = vInfer<typeof factory>;

  expectTypeOf<Result>().toEqualTypeOf<{ role: string }>();
});

it('supports parameterized schema factories at runtime', () => {
  const factory = schemaFactory((required: boolean) =>
    object({
      name: required ? string() : string().optional(),
    }),
  );

  expect(factory(true).parse({ name: 'Ada' })).toEqual({ name: 'Ada' });
  expect(factory(false).parse({})).toEqual({});
});

it('preserves argument signatures for parameterized factories', () => {
  const factory = schemaFactory((prefix: string, required: boolean) =>
    object({
      name: required ? string() : string().optional(),
      prefix: string().default(prefix),
    }),
  );

  expectTypeOf(factory).toBeCallableWith('id-', true);
  expectTypeOf(factory).returns.toEqualTypeOf<VetoTypeAny>();
});

it('supports type inference from parameterized factories', () => {
  const factory = schemaFactory((required: boolean) =>
    object({
      name: required ? string() : string().optional(),
    }),
  );
  type FactoryOutput = vInferFactory<typeof factory>;
  type VInferOutput = vInfer<typeof factory>;

  expectTypeOf<FactoryOutput>().toEqualTypeOf<{ name: string | undefined }>();
  expectTypeOf<VInferOutput>().toEqualTypeOf<{ name: string | undefined }>();
});
