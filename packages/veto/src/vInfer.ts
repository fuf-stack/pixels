import type { z } from 'zod';
import type { VetoTypeAny } from './types';

/**
 * Infers one property value in a raw veto shape.
 *
 * - schema nodes (`VetoTypeAny`) are inferred via `z.infer`
 * - nested raw objects recurse into {@link InferRawShape}
 * - non-schema leaf values resolve to `never`
 */
type InferRawValue<T> = T extends VetoTypeAny
  ? z.infer<T>
  : T extends Record<string, unknown>
    ? InferRawShape<T>
    : never;

/**
 * Flattens mapped/intersection helper types for cleaner IDE display and
 * more stable type comparisons in tests.
 */
type Simplify<T> = { [K in keyof T]: T[K] };

/**
 * Infers a full raw veto shape object, preserving optional properties.
 *
 * Keys whose inferred value includes `undefined` are emitted as optional;
 * all other keys are emitted as required.
 */
type InferRawShape<T extends Record<string, unknown>> = Simplify<
  {
    [K in keyof T as undefined extends InferRawValue<T[K]>
      ? never
      : K]: InferRawValue<T[K]>;
  } & {
    [K in keyof T as undefined extends InferRawValue<T[K]>
      ? K
      : never]?: InferRawValue<T[K]>;
  }
>;

/**
 * This TypeScript type alias `vInfer` defines a conditional type that takes
 * a generic type parameter `T` and infers the validated output shape.
 *
 * Supported inputs:
 * - a raw schema definition (`VetoRawShape`)
 * - a schema instance (`VetoTypeAny`)
 * - a portable schema factory produced by `schemaFactory` (detected via
 *   `__vetoOutput` metadata)
 *
 * Inference behavior:
 * - if `T` carries `__vetoOutput`, read the output type directly (no Zod
 *   internals are referenced, which is what makes factory exports portable)
 * - if `T` is already a schema instance, infer directly via `z.infer`
 * - if `T` is a raw veto shape (record of schemas / nested raw shapes),
 *   recurse into {@link InferRawShape}
 *
 * The resulting type represents the expected data shape after validation,
 * preserving type safety for veto consumers while supporting portable factory
 * signatures for declaration emit.
 *
 * @see https://zod.dev/?id=type-inference
 */
export type vInfer<T> = '__vetoOutput' extends keyof T
  ? // Portable factory path: read output metadata directly. The phantom
    // metadata is a plain TS shape, so this branch never names Zod internals.
    T extends { readonly __vetoOutput?: infer TOutput }
    ? TOutput
    : never
  : // infer directly when already veto/zod schema
    T extends VetoTypeAny
    ? z.infer<T>
    : // infer nested raw veto shapes recursively
      T extends Record<string, unknown>
      ? InferRawShape<T>
      : never;
