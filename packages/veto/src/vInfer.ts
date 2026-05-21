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
 * - a schema instance (`VetoTypeAny`)
 * - a raw veto shape (record of schemas / nested raw shapes)
 *
 * The resulting type represents the expected data shape after validation,
 * preserving type safety for veto consumers.
 *
 * @see https://zod.dev/?id=type-inference
 */
export type vInfer<T> = T extends VetoTypeAny
  ? z.infer<T>
  : T extends Record<string, unknown>
    ? InferRawShape<T>
    : never;
