import type { output } from 'zod';
import type { VetoTypeAny } from './types';

/**
 * Portable schema factory shape for declaration emit.
 *
 * The callable signature intentionally returns `VetoTypeAny` (opaque) to avoid
 * leaking concrete Zod internals from consumer exports. The generic `Schema`
 * parameter is stored only as phantom type metadata for inference helpers.
 */
export type VSchemaFactory<Schema extends VetoTypeAny = VetoTypeAny> =
  (() => VetoTypeAny) & {
    readonly __vetoSchema?: Schema;
  };

/**
 * Parameterized variant of {@link VSchemaFactory}.
 */
export type VSchemaFactoryWithArgs<
  Schema extends VetoTypeAny = VetoTypeAny,
  Args extends unknown[] = unknown[],
> = ((...args: Args) => VetoTypeAny) & {
  readonly __vetoSchema?: Schema;
};

/**
 * Extracts the inferred output type from a schema factory created with
 * {@link schemaFactory}.
 */
export type vInferFactory<TFactory> = '__vetoSchema' extends keyof TFactory
  ? TFactory extends {
      readonly __vetoSchema?: infer Schema;
    }
    ? Schema extends VetoTypeAny
      ? output<Schema>
      : never
    : never
  : never;

/**
 * Wraps a schema instance or parameterized schema factory into a portable
 * factory function.
 */
export function schemaFactory<Schema extends VetoTypeAny>(
  schema: Schema,
): VSchemaFactory<Schema>;
export function schemaFactory<
  Schema extends VetoTypeAny,
  Args extends unknown[],
>(
  schemaFactoryFn: (...args: Args) => Schema,
): VSchemaFactoryWithArgs<Schema, Args>;
export function schemaFactory<
  Schema extends VetoTypeAny,
  Args extends unknown[],
>(
  schemaOrFactory: Schema | ((...args: Args) => Schema),
): VSchemaFactory<Schema> | VSchemaFactoryWithArgs<Schema, Args> {
  if (typeof schemaOrFactory === 'function') {
    return (...args: Args) => {
      return schemaOrFactory(...args);
    };
  }
  return () => {
    return schemaOrFactory;
  };
}
