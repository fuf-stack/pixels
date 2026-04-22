import type { VetoErrorMap } from './types';

import { z } from 'zod';

import { issueCodes } from './issueCodes';

/**
 * Sentinel string used to smuggle structured metadata through Zod v4's public
 * issue object.
 *
 * Zod v4 only preserves `code`, `message`, `path`, and a handful of issue-
 * specific fields on the issue exposed to consumers — `input`/`inst`/etc. are
 * dropped. To keep veto's v0 error contract (`received`, `options`, ...) we
 * JSON-encode the data we need into the message inside this sentinel marker.
 *
 * `normalizeIssue` in `normalizeIssue.ts` reads and strips it before formatting.
 *
 * The leading NULs make accidental human-readable collisions impossible.
 */
export const VETO_META_SENTINEL = '\u0000__veto_meta__\u0000';

/**
 * Returns the type of `input` using the wording veto v0 used (matches the
 * old Zod v3 `received` field — `'null'` is distinct from `'object'`,
 * arrays surface as `'array'`).
 */
const getReceivedType = (input: unknown): string => {
  if (input === null) {
    return 'null';
  }
  if (Array.isArray(input)) {
    return 'array';
  }
  return typeof input;
};

const encodeMeta = (message: string, meta: Record<string, unknown>): string => {
  return `${message}${VETO_META_SENTINEL}${JSON.stringify(meta)}`;
};

/**
 * Walks a discriminated-union schema instance to collect the literal values
 * declared at the discriminator field. Used to repopulate the v0 `options`
 * field for "missing discriminator" issues.
 */
const collectDiscriminatorOptions = (
  inst: unknown,
  discriminator: string,
): unknown[] | undefined => {
  // Zod v4 internals: the schema instance has `def.options` (array of branch
  // schemas), each with `def.shape[discriminator].def.values` for literal
  // discriminators. This matches Zod v4 4.x — guard defensively.
  const options = (inst as { def?: { options?: unknown[] } } | undefined)?.def
    ?.options;
  if (!Array.isArray(options)) {
    return undefined;
  }
  const values: unknown[] = [];
  options.forEach((branch) => {
    const literalValues = (
      branch as {
        def?: {
          shape?: Record<string, { def?: { values?: unknown[] } } | undefined>;
        };
      }
    )?.def?.shape?.[discriminator]?.def?.values;
    if (Array.isArray(literalValues)) {
      values.push(...literalValues);
    }
  });
  return values.length ? values : undefined;
};

const formatEnumOption = (value: unknown): string => {
  return typeof value === 'string' ? `'${value}'` : String(value);
};

/**
 * Global Zod v4 error map for veto.
 *
 * Zod v4 invokes the error map with a single `issue` argument (no `ctx`).
 * The issue carries `input`/`inst` here, but those are stripped on the public
 * issue exposed via `result.error.issues`. To preserve veto's v0 contract for
 * downstream consumers, we encode any v4-only fields we need to recover into
 * the message via {@link VETO_META_SENTINEL}.
 *
 * Exported for unit testing — the runtime registration via `z.config` below
 * makes the live behavior accessible through `safeParse`.
 *
 * @see https://zod.dev/v4/changelog#error-handling
 */
export const vetoErrorMap: VetoErrorMap = (issue) => {
  switch (issue.code) {
    // Zod v4 drops `received` from the public issue. Re-attach it here, and
    // map null/undefined to "Field is required" to preserve the v0 contract.
    case issueCodes.invalid_type: {
      const received = getReceivedType(issue.input);
      if (received === 'null' || received === 'undefined') {
        return encodeMeta('Field is required', { received });
      }
      // Non-null/undefined invalid_type: let the default Zod message
      // ("Invalid input: expected X, received Y") flow. `normalizeIssue`
      // parses the received type out of that message and rewrites it.
      return undefined;
    }

    // Zod v4 collapses `invalid_union_discriminator` into `invalid_union`.
    // For discriminated unions where the discriminator is missing, surface
    // "Field is required" + the literal options list (v0 contract).
    case issueCodes.invalid_union: {
      const discriminator =
        typeof issue.discriminator === 'string'
          ? issue.discriminator
          : undefined;
      if (!discriminator) {
        return undefined;
      }
      const inputObj = issue.input as
        | Record<string, unknown>
        | null
        | undefined;
      if (inputObj?.[discriminator] === undefined) {
        const options = collectDiscriminatorOptions(issue.inst, discriminator);
        return encodeMeta('Field is required', {
          received: 'undefined',
          ...(options ? { options } : {}),
        });
      }
      return undefined;
    }

    // Zod v4 represents both enums and literals as `invalid_value`. Restore
    // the v0 `invalid_enum_value`/`invalid_literal` codes plus the original
    // `received` value (which Zod strips from the public issue).
    case issueCodes.invalid_value: {
      if (issue.input === undefined) {
        return encodeMeta('Field is required', { received: 'undefined' });
      }
      const values = Array.isArray(issue.values) ? issue.values : [];
      if (values.length === 1) {
        // Single allowed value -> literal
        return encodeMeta(
          `Invalid literal value, expected ${formatEnumOption(values[0])}`,
          { input: issue.input },
        );
      }
      const formattedOptions = values.map(formatEnumOption).join(' | ');
      return encodeMeta(
        `Invalid enum value. Expected ${formattedOptions}, received ${formatEnumOption(issue.input)}`,
        { input: issue.input },
      );
    }

    default:
      return undefined;
  }
};

// Register the global error map. The cast is needed because Zod's exported
// `customError` type is a discriminated union over all issue codes, while
// `VetoErrorMap` is a loose superset suited for veto's switch-based handler.
z.config({
  customError: vetoErrorMap as NonNullable<
    Parameters<typeof z.config>[0]
  >['customError'],
});
