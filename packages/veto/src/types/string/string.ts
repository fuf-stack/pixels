import type { VetoOptional, VetoRefinementCtx } from 'src/types';
import type { ZodString } from 'zod';

import { z } from 'zod';

export interface VStringOptions {
  /** min string length, defaults to 1 */
  min: number;
}

export const string = (options?: VStringOptions): VStringSchema => {
  return (
    z
      // see: https://zod.dev/?id=strings
      .string()
      // we always trim whitespace
      .trim()
      // expect strings to be at least 1 char long by default
      .min(options?.min || options?.min === 0 ? options.min : 1)
  );
};

export type VString = typeof string;
export type VStringSchema = ZodString;

interface BlacklistOptions {
  /** Custom error message function */
  message?: (val: string) => string;
  /** Array of patterns to blacklist. Supports * wildcard */
  patterns: string[];
}

/** Refinement to blacklist certain string values */
const blacklist = (options: BlacklistOptions) => {
  return (val: string, ctx: VetoRefinementCtx) => {
    // Convert blacklist patterns to regex patterns
    const blacklistRegexes = options.patterns.map((pattern) => {
      const regexPattern = pattern
        .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(`^${regexPattern}$`, 'i');
    });

    // Check for blacklist entries with regex patterns
    if (
      blacklistRegexes.some((regex) => {
        return regex.test(val);
      })
    ) {
      ctx.addIssue({
        code: 'custom',
        message: options.message
          ? options.message(val)
          : `Value '${val}' is blacklisted`,
      });
    }
  };
};

interface NoConsecutiveCharactersOptions {
  /** Custom error message function */
  message?: (val: string) => string;
  /** Characters that cannot appear consecutively */
  characters: string[];
}

/** Refinement to prevent certain consecutive characters */
const noConsecutiveCharacters = (options: NoConsecutiveCharactersOptions) => {
  return (val: string, ctx: VetoRefinementCtx) => {
    for (let i = 0; i < val.length - 1; i += 1) {
      const currentChar = val[i];
      const nextChar = val[i + 1];

      if (
        options.characters.includes(currentChar) &&
        currentChar === nextChar
      ) {
        ctx.addIssue({
          code: 'custom',
          message: options.message
            ? options.message(currentChar)
            : `Character '${currentChar}' cannot appear consecutively`,
        });
        return;
      }
    }
  };
};

/** Configuration options for string validation refinements */
export interface VStringRefinements {
  /** Filter out strings matching blacklist patterns with optional custom error messages */
  blacklist?: BlacklistOptions;
  /** Custom refinement function for additional validation rules (will be applied first when present) */
  custom?: (val: string, ctx: VetoRefinementCtx) => void;
  /** Prevent specified characters from appearing consecutively */
  noConsecutiveCharacters?: NoConsecutiveCharactersOptions;
}

/**
 * Applies validation refinements to a string schema
 * @param schema - Base string schema to refine
 * @returns Function that takes refinement options and returns enhanced schema
 * @example
 * ```ts
 * const schema = refineString(string())({
 *   custom: (val, ctx) => {
 *     if (!val.includes('@')) {
 *       ctx.addIssue({ code: 'custom', message: 'Must contain @' });
 *     }
 *   },
 *   blacklist: { patterns: ['invalid*'] },
 *   noConsecutiveCharacters: { characters: ['!', '@'] }
 * });
 * ```
 */
export function refineString(
  schema: VStringSchema,
): (refinements: VStringRefinements) => VStringSchema;
export function refineString(
  schema: VetoOptional<VStringSchema>,
): (refinements: VStringRefinements) => VetoOptional<VStringSchema>;
export function refineString(
  schema: VStringSchema | VetoOptional<VStringSchema>,
) {
  return (refinements: VStringRefinements) => {
    return schema.superRefine((val, ctx) => {
      // Skip refinements if value is undefined (because it is optional)
      if (val === undefined) {
        return;
      }

      // add custom refinement first
      if (refinements.custom) {
        refinements.custom(val, ctx);
      }

      // add blacklist refinement
      if (refinements.blacklist) {
        blacklist(refinements.blacklist)(val, ctx);
      }

      // add noConsecutiveCharacters refinement
      if (refinements.noConsecutiveCharacters) {
        noConsecutiveCharacters(refinements.noConsecutiveCharacters)(val, ctx);
      }
    }) as unknown as VStringSchema | VetoOptional<VStringSchema>;
  };
}
