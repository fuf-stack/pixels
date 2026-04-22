import type {
  input,
  output,
  RefinementCtx,
  ZodError,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodSafeParseSuccess,
  ZodType,
} from 'zod';

export type VetoRawShape = Record<string, VetoTypeAny>;

export type VetoTypeAny = ZodType;

export type VetoNullable<T extends VetoTypeAny> = ZodNullable<T>;

export type VetoOptional<T extends VetoTypeAny> = ZodOptional<T>;

export type VetoObject<T extends ZodRawShape> = ZodObject<T>;

export type Input<T extends VetoTypeAny> = input<T>;
export type Output<T extends VetoTypeAny> = output<T>;

export type VetoEffects<T extends VetoTypeAny> = ZodType<Output<T>, Input<T>>;

export type VetoRefinementCtx = RefinementCtx;

/** veto schema types */

/**
 * Error map signature compatible with Zod v4.
 *
 * Zod v4 calls the global error map with a single `issue` argument; the
 * second `ctx` argument from v3 is gone. The `issue` shape varies by
 * `issue.code`, so we type it loosely here and let `errorMap.ts` narrow
 * inside each switch branch.
 *
 * @see https://zod.dev/v4/error-customization
 */
export type VetoErrorMap = (issue: {
  code?: string;
  input?: unknown;
  path?: PropertyKey[];
  [key: string]: unknown;
}) => string | { message: string } | undefined;

export type VetoSchema = VetoRawShape | VetoTypeAny;

export interface VetoOptions {
  /** optional defaults for the veto */
  defaults?: Record<string, unknown>;
}

export type VetoInput = Record<string, unknown>;

type SafeParseSuccess<SchemaType> = ZodSafeParseSuccess<SchemaType>;

export type VetoSuccess<SchemaType> = SafeParseSuccess<SchemaType> & {
  errors: null;
};

interface VetoFieldError {
  code: string;
  message: string;
  [key: string]: unknown;
}

export type VetoFormattedError = Record<string, VetoFieldError[]> & {
  _errors?: VetoFieldError[];
};

export interface VetoError {
  success: false;
  data: null;
  errors: VetoFormattedError;
}

/**
 * Raw zod error before veto formatting.
 *
 * Typed as `ZodError<unknown>` because `formatError` only inspects
 * `error.issues` and never touches the parsed value type.
 */
export type VetoUnformattedError = ZodError;
