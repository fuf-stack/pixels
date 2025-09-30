// eslint-disable-next-line import-x/no-extraneous-dependencies
import type { z } from 'zod';
import type {
  VetoObject,
  VetoRawShape,
  VetoSchema,
  VetoTypeAny,
} from './types';

/**
 * This TypeScript type alias vInfer defines a conditional type that
 * takes in a generic type parameter T, which can either be a schema
 * definition from the VetoSchema interface or a schema
 * instance from the VetoTypeAny interface.
 *
 * If T is a schema definition from VetoSchema, it is
 * converted into a VetoObject and its inferred type is returned
 * using the z.infer method. If T is already a VetoTypeAny schema
 * instance, then the inferred type is simply returned
 * using the z.infer method.
 *
 * The resulting inferred type returned by vInfer is a
 * TypeScript type that represents the expected shape of data
 * validated by the given schema. This ensures type safety when
 * working with ex-veto data.
 *
 * @see https://zod.dev/?id=type-inference
 */
export type vInfer<T extends VetoSchema> =
  // wrap raw shapes with VetoObject
  T extends VetoRawShape
    ? z.infer<VetoObject<T>>
    : // just infer type when already veto object
      T extends VetoTypeAny
      ? z.infer<T>
      : never;
