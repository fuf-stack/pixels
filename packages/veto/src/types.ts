import type { z } from 'zod';

// Re-export commonly used Zod types for Zod v4
export type VetoRawShape = z.ZodRawShape;

export type VetoTypeAny = z.ZodTypeAny;

export type VetoNullable<T extends VetoTypeAny> = z.ZodNullable<T>;

export type VetoOptional<T extends VetoTypeAny> = z.ZodOptional<T>;

// In Zod v4, ZodObject type parameters changed
export type VetoObject<T extends z.ZodRawShape> = z.ZodObject<T>;

export declare type Input<T extends VetoTypeAny> = z.input<T>;
export declare type Output<T extends VetoTypeAny> = z.output<T>;

// In Zod v4, effects work differently - use the return type of superRefine
export type VetoEffects<T extends VetoTypeAny> = ReturnType<T['superRefine']>;

// Refinement context type for Zod v4
export type VetoRefinementCtx = z.RefinementCtx;

/** veto schema types */

export type VetoSchema = VetoRawShape | VetoTypeAny;

export interface VetoOptions {
  /** optional defaults for the veto */
  defaults?: Record<string, unknown>;
}

export type VetoInput = Record<string, unknown>;

export interface VetoSuccess<SchemaType> {
  success: true;
  data: SchemaType;
  errors: null;
}

interface VetoFieldError {
  code: string;
  message: string;
}

export type VetoFormattedError = Record<string, VetoFieldError[]> & {
  _errors?: VetoFieldError[];
};

export interface VetoError {
  success: false;
  data: null;
  errors: VetoFormattedError;
}
