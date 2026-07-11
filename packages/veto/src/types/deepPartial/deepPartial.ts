import type {
  Input,
  Output,
  VetoObject,
  VetoRawShape,
  VetoTypeAny,
} from 'src/types';

import { z } from 'zod';

import { and } from '../and/and';
import { array } from '../array/array';
import { discriminatedUnion } from '../discriminatedUnion/discriminatedUnion';
import { or } from '../or/or';
import { record } from '../record/record';

/**
 * Recursive partial type used for schema-backed override configs.
 *
 * Runtime semantics intentionally differ by container:
 * - object properties become optional recursively,
 * - tuple slots stay present but their values are deep-partialed,
 * - arrays keep their array shape and deep-partial their element type.
 *
 * This means `string[]` stays `string[]`, while `{ count: number }[]` becomes
 * `{ count?: number }[]`.
 */
export type DeepPartial<TValue> = TValue extends (...args: never[]) => unknown
  ? TValue
  : TValue extends readonly [unknown, ...unknown[]]
    ? { [TKey in keyof TValue]: DeepPartial<TValue[TKey]> }
    : TValue extends readonly (infer TItem)[]
      ? DeepPartial<TItem>[]
      : TValue extends object
        ? { [TKey in keyof TValue]?: DeepPartial<TValue[TKey]> }
        : TValue;

/**
 * Deep-partials an object-like branch while keeping a specific key required.
 *
 * Discriminated unions need this because making the discriminator optional
 * would make Zod unable to pick the branch at runtime.
 */
type DeepPartialWithRequiredKey<
  TValue,
  TRequiredKey extends PropertyKey,
> = TValue extends object
  ? {
      [TKey in Extract<keyof TValue, TRequiredKey>]: TValue[TKey];
    } & {
      [TKey in Exclude<keyof TValue, TRequiredKey>]?: DeepPartial<TValue[TKey]>;
    }
  : DeepPartial<TValue>;

/** Extracts the discriminator key from veto's marker or Zod's schema metadata. */
type DiscriminatorKey<TSchema> = TSchema extends {
  readonly _vetoDiscriminator: infer TDiscriminator;
}
  ? TDiscriminator extends PropertyKey
    ? TDiscriminator
    : never
  : TSchema extends {
        def: { discriminator: infer TDiscriminator };
      }
    ? TDiscriminator extends PropertyKey
      ? TDiscriminator
      : never
    : TSchema extends { _def: { discriminator: infer TDiscriminator } }
      ? TDiscriminator extends PropertyKey
        ? TDiscriminator
        : never
      : never;

/** Output type produced by the deep-partial schema. */
type DeepPartialOutput<TSchema extends VetoTypeAny> = TSchema extends
  | z.ZodDiscriminatedUnion
  | { readonly _vetoDiscriminator: PropertyKey }
  ? DeepPartialWithRequiredKey<Output<TSchema>, DiscriminatorKey<TSchema>>
  : DeepPartial<Output<TSchema>>;

/** Input type accepted by the deep-partial schema. */
type DeepPartialInput<TSchema extends VetoTypeAny> = TSchema extends
  | z.ZodDiscriminatedUnion
  | { readonly _vetoDiscriminator: PropertyKey }
  ? DeepPartialWithRequiredKey<Input<TSchema>, DiscriminatorKey<TSchema>>
  : DeepPartial<Input<TSchema>>;

/** Schema type returned from `deepPartial(...)`. */
type DeepPartialSchema<TSchema extends VetoTypeAny> = z.ZodType<
  DeepPartialOutput<TSchema>,
  DeepPartialInput<TSchema>
>;

interface PartialObjectOptions {
  /** Keys that must remain required, e.g. a discriminated union discriminator. */
  requiredKeys?: ReadonlySet<PropertyKey>;
}

interface SchemaWithOptions {
  /** Branch schemas exposed by Zod union-like schemas at runtime. */
  options: readonly unknown[];
}

interface SchemaWithDiscriminator {
  /** Discriminator key exposed by Zod discriminated unions. */
  discriminator?: string;
  /** Internal fallback for Zod builds that only expose the discriminator there. */
  _def?: {
    discriminator?: string;
  };
}

interface SchemaWithIntersectionSides {
  /** Internal intersection operands used because Zod has no public accessors. */
  _def: {
    left: unknown;
    right: unknown;
  };
}

interface SchemaWithRecordTypes {
  /** Key schema exposed by Zod record schemas. */
  keyType: VetoTypeAny;
  /** Value schema exposed by Zod record schemas. */
  valueType: unknown;
}

interface SchemaWithTupleItems {
  /** Tuple item schemas exposed by Zod tuple schemas. */
  def: {
    items: unknown[];
    rest?: unknown;
  };
}

interface SchemaWithDefaultValue {
  /** Default value passed to `.default(...)`. */
  def: {
    defaultValue: unknown;
  };
}

interface SchemaWithCatchValue {
  /** Catch value callback passed to `.catch(...)`. */
  def: {
    catchValue: (ctx: { error: unknown; input: unknown }) => unknown;
  };
}

interface SchemaWithLazyGetter {
  /** Lazily resolves the wrapped schema. */
  def: {
    getter: () => VetoTypeAny;
  };
}

/** Narrows an array to Zod's required non-empty union/discriminated tuple. */
const createSchemaList = (schemas: VetoTypeAny[]) => {
  return schemas as [VetoTypeAny, VetoTypeAny, ...VetoTypeAny[]];
};

/**
 * Reads the discriminator key from either public-ish Zod metadata or the
 * internal fallback used by some Zod builds.
 */
const getDiscriminator = (schema: VetoTypeAny) => {
  const discriminatedSchema = schema as SchemaWithDiscriminator;
  return (
    discriminatedSchema.discriminator ??
    discriminatedSchema._def?.discriminator ??
    ''
  );
};

/** Reads the branch schemas from union-like schemas. */
const getOptions = (schema: VetoTypeAny) => {
  return [
    ...((schema as unknown as SchemaWithOptions).options ?? []),
  ] as VetoTypeAny[];
};

/**
 * Deep-partials an object shape while preserving the original object mode.
 *
 * `input.extend(...)` keeps strict objects strict and loose objects loose,
 * which is important for veto's `object(...)` default behavior.
 */
const deepPartialObject = (
  input: VetoObject<VetoRawShape>,
  { requiredKeys = new Set<PropertyKey>() }: PartialObjectOptions = {},
) => {
  const partialShape = Object.fromEntries(
    Object.entries(input.shape).map(([key, value]) => {
      const partialValue = deepPartial(value);
      return [
        key,
        requiredKeys.has(key) ? partialValue : partialValue.optional(),
      ];
    }),
  );

  return input.extend(partialShape);
};

/** Deep-partials one discriminated-union option while keeping its discriminator. */
const deepPartialDiscriminatedOption = (
  input: VetoTypeAny,
  discriminator: string,
) => {
  if (input instanceof z.ZodObject) {
    return deepPartialObject(input, {
      requiredKeys: new Set([discriminator]),
    });
  }

  return deepPartial(input);
};

/**
 * Builds a deep-partial variant of a Zod schema.
 *
 * Supports objects, top-level/nested arrays, tuples, records,
 * optional/nullable/default/catch/readonly/lazy wrappers, unions,
 * discriminated unions, and intersections.
 */
export const deepPartial = <TSchema extends VetoTypeAny>(
  input: TSchema,
): DeepPartialSchema<TSchema> => {
  if (input instanceof z.ZodObject) {
    return deepPartialObject(input) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodArray) {
    return array(
      deepPartial(input.element as unknown as VetoTypeAny),
    ) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodTuple) {
    const { items, rest } = (input as unknown as SchemaWithTupleItems).def;
    // Tuple positions remain required; only each position's value shape changes.
    const partialTuple = z.tuple(
      items.map((item) => {
        return deepPartial(item as VetoTypeAny);
      }) as Parameters<typeof z.tuple>[0],
    );

    return (rest
      ? partialTuple.rest(deepPartial(rest as VetoTypeAny))
      : partialTuple) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodRecord) {
    const { keyType, valueType } = input as unknown as SchemaWithRecordTypes;

    return record(
      keyType as Parameters<typeof record>[0],
      deepPartial(valueType as VetoTypeAny),
    ) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodOptional) {
    return deepPartial(
      input.unwrap() as unknown as VetoTypeAny,
    ).optional() as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodNullable) {
    return deepPartial(
      input.unwrap() as unknown as VetoTypeAny,
    ).nullable() as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodDefault) {
    const { defaultValue } = (input as unknown as SchemaWithDefaultValue).def;

    return deepPartial(input.unwrap() as unknown as VetoTypeAny).default(
      defaultValue,
    ) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodCatch) {
    const { catchValue } = (input as unknown as SchemaWithCatchValue).def;

    return deepPartial(input.unwrap() as unknown as VetoTypeAny).catch(
      catchValue,
    ) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodReadonly) {
    return deepPartial(
      input.unwrap() as unknown as VetoTypeAny,
    ).readonly() as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodLazy) {
    const { getter } = (input as unknown as SchemaWithLazyGetter).def;

    return z.lazy(() => {
      return deepPartial(getter());
    }) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodDiscriminatedUnion) {
    const discriminator = getDiscriminator(input);
    const options = getOptions(input).map((option) => {
      return deepPartialDiscriminatedOption(option, discriminator);
    });

    return discriminatedUnion(
      discriminator,
      createSchemaList(options),
    ) as unknown as DeepPartialSchema<TSchema>;
  }

  if (input instanceof z.ZodUnion) {
    const options = getOptions(input).map((option) => {
      return deepPartial(option);
    });

    return or(
      ...createSchemaList(options),
    ) as unknown as DeepPartialSchema<TSchema>;
  }

  // `and(...)` creates a ZodIntersection, so runtime detection still needs the
  // Zod constructor even though rebuilding uses veto's wrapper below.
  if (input instanceof z.ZodIntersection) {
    const { left, right } = (input as unknown as SchemaWithIntersectionSides)
      ._def;

    return and(
      deepPartial(left as VetoTypeAny),
      deepPartial(right as VetoTypeAny),
    ) as unknown as DeepPartialSchema<TSchema>;
  }

  // Primitive and effect-like schemas keep their original validation behavior.
  return input as unknown as DeepPartialSchema<TSchema>;
};
