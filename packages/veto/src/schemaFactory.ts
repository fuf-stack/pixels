import type { output } from 'zod';
import type { VetoTypeAny } from './types';

/**
 * Portable schema factory shape for declaration emit.
 *
 * The callable signature intentionally returns `VetoTypeAny` (opaque) to avoid
 * leaking concrete Zod internals from consumer exports.
 *
 * The generic parameter is the inferred OUTPUT type (a plain TS shape), not
 * the schema type. Carrying an output type as phantom metadata means
 * TypeScript never needs to name `.pnpm/zod@.../ZodString` etc. when printing
 * inferred factory symbols, which is what avoids `TS2742`/`TS2883` in pnpm
 * monorepos.
 */
export type VSchemaFactory<Output = unknown> = (() => VetoTypeAny) & {
  readonly __vetoOutput?: Output;
};

/**
 * Parameterized variant of {@link VSchemaFactory}.
 *
 * Like `VSchemaFactory`, the generic is the inferred OUTPUT type, not the
 * schema type.
 */
export type VSchemaFactoryWithArgs<
  Output = unknown,
  Args extends unknown[] = unknown[],
> = ((...args: Args) => VetoTypeAny) & {
  readonly __vetoOutput?: Output;
};

/**
 * Extracts the inferred output type from a schema factory created with
 * {@link schemaFactory}. Reads the `__vetoOutput` phantom metadata directly,
 * so inference contains no Zod internals.
 */
export type vInferFactory<TFactory> = TFactory extends {
  readonly __vetoOutput?: infer TOutput;
}
  ? TOutput
  : never;

/**
 * Wraps a schema instance or parameterized schema factory into a portable
 * factory function.
 *
 * The returned factory's visible inferred type is
 * `VSchemaFactory<Output>` — a plain TS shape — so consumers can re-export
 * the factory without triggering `TS2742`/`TS2883`.
 */
export function schemaFactory<Schema extends VetoTypeAny>(
  schema: Schema,
): VSchemaFactory<output<Schema>>;
export function schemaFactory<
  Schema extends VetoTypeAny,
  Args extends unknown[],
>(
  schemaFactoryFn: (...args: Args) => Schema,
): VSchemaFactoryWithArgs<output<Schema>, Args>;
export function schemaFactory<
  Schema extends VetoTypeAny,
  Args extends unknown[],
>(
  schemaOrFactory: Schema | ((...args: Args) => Schema),
):
  | VSchemaFactory<output<Schema>>
  | VSchemaFactoryWithArgs<output<Schema>, Args> {
  if (typeof schemaOrFactory === 'function') {
    return (...args: Args) => {
      return schemaOrFactory(...args);
    };
  }
  return () => {
    return schemaOrFactory;
  };
}
