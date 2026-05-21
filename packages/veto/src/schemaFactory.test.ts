/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable vitest/expect-expect */

import type { vInferFactory } from './schemaFactory';
import type { VetoTypeAny } from './types';
import type { vInfer } from './vInfer';

import { expect, expectTypeOf, it } from 'vitest';

import { schemaFactory } from './schemaFactory';
import { discriminatedUnion } from './types/discriminatedUnion/discriminatedUnion';
import { literal } from './types/literal/literal';
import { number } from './types/number/number';
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

it('stores inferred output (not the schema type) as phantom metadata', () => {
  // Portability lock-in: the factory's `__vetoOutput` phantom is a plain TS
  // shape. Carrying the OUTPUT type (not the SCHEMA type) here is what makes
  // exported factories portable across pnpm monorepos without triggering
  // TS2742/TS2883.
  const factory = schemaFactory(
    object({
      id: string(),
      label: string().optional(),
    }),
  );

  type Metadata = (typeof factory)['__vetoOutput'];

  expectTypeOf<Metadata>().toEqualTypeOf<
    { id: string; label?: string | undefined } | undefined
  >();
});

it('stores inferred output as phantom metadata for parameterized factories', () => {
  // Same portability lock-in as the no-args variant, but for the
  // `VSchemaFactoryWithArgs` shape. The args generic must not leak into the
  // output-metadata position.
  const factory = schemaFactory((required: boolean) =>
    object({
      name: required ? string() : string().optional(),
    }),
  );

  type Metadata = (typeof factory)['__vetoOutput'];

  expectTypeOf<Metadata>().toEqualTypeOf<
    { name: string | undefined } | undefined
  >();
});

it('infers transform output type (not input type) for piped schemas', () => {
  // Contract: phantom metadata carries the OUTPUT type. For schemas with a
  // transform, this means the post-transform type, not the input type.
  const factory = schemaFactory(string().transform((s) => s.length));
  type Result = vInferFactory<typeof factory>;

  expectTypeOf<Result>().toEqualTypeOf<number>();
});

it('does not expose legacy __vetoSchema metadata', () => {
  // Breaking-change lock-in: the previous metadata key was `__vetoSchema`
  // (carried the schema type and caused TS2742/TS2883 in consumer packages).
  // If this regresses, consumer exports start triggering portability errors
  // again.
  const factory = schemaFactory(
    object({
      id: string(),
    }),
  );

  type HasLegacyMetadata = '__vetoSchema' extends keyof typeof factory
    ? true
    : false;

  expectTypeOf<HasLegacyMetadata>().toEqualTypeOf<false>();
});

it('resolves to never for non-factory inputs', () => {
  // Defensive guard: `__vetoOutput?` is an optional field, so structurally
  // any type would satisfy `{ readonly __vetoOutput?: infer T }`. Without the
  // `keyof` guard in `vInferFactory`, primitives and unrelated objects would
  // silently resolve to `unknown`. Locking down `never` here prevents that
  // regression.
  type FromPrimitive = vInferFactory<string>;
  type FromNumber = vInferFactory<number>;
  type FromPlainObject = vInferFactory<{ id: string }>;
  type FromUnknown = vInferFactory<unknown>;

  expectTypeOf<FromPrimitive>().toBeNever();
  expectTypeOf<FromNumber>().toBeNever();
  expectTypeOf<FromPlainObject>().toBeNever();
  expectTypeOf<FromUnknown>().toBeNever();
});

it('infers discriminated union output via factory', () => {
  // Union/discriminated-union outputs are a common place inference quietly
  // degrades. Lock in that the factory path preserves the precise union.
  const factory = schemaFactory(
    discriminatedUnion('kind', [
      object({ kind: literal('a'), value: string() }),
      object({ kind: literal('b'), count: number() }),
    ]),
  );

  type Result = vInferFactory<typeof factory>;

  expectTypeOf<Result>().toEqualTypeOf<
    { kind: 'a'; value: string } | { kind: 'b'; count: number }
  >();
});
