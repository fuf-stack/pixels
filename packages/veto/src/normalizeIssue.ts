import { VETO_META_SENTINEL } from './errorMap';
import { issueCodes } from './issueCodes';

/**
 * Loose shape of a Zod v4 issue augmented with the optional fields veto
 * surfaces back to consumers (e.g. `received`, `options`).
 */
export interface VetoIssueLike extends Record<string, unknown> {
  _errorPath?: (string | number)[];
  code?: string;
  message?: string;
  path?: (string | number)[];
}

/**
 * Stringifies values that may show up in error messages (numbers, bigints,
 * Dates, plain objects). Falls back to JSON for objects so we never end up
 * with literal "[object Object]" strings inside user-facing messages.
 */
const stringifyForMessage = (value: unknown): string => {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  try {
    return JSON.stringify(value) ?? Object.prototype.toString.call(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
};

/**
 * Splits a Zod issue message into the user-visible part and the optional
 * meta payload that `errorMap` encoded via {@link VETO_META_SENTINEL}.
 *
 * With `safeParse(..., { reportInput: true })`, `issue.input` is now available
 * on public issues. The sentinel remains as a backward-compatible fallback for
 * metadata that may still be encoded by the global error map.
 */
const extractMessageMeta = (
  rawMessage: unknown,
): { message: string | undefined; meta: Record<string, unknown> } => {
  if (typeof rawMessage !== 'string') {
    return { message: undefined, meta: {} };
  }
  const sentinelIndex = rawMessage.indexOf(VETO_META_SENTINEL);
  if (sentinelIndex === -1) {
    return { message: rawMessage, meta: {} };
  }
  const cleanMessage = rawMessage.slice(0, sentinelIndex);
  const metaJson = rawMessage.slice(sentinelIndex + VETO_META_SENTINEL.length);
  try {
    const parsed = JSON.parse(metaJson);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { message: cleanMessage, meta: parsed as Record<string, unknown> };
    }
  } catch {
    // Fall through to no-meta result.
  }
  return { message: cleanMessage, meta: {} };
};

/** invalid_type: ensure `received` is set and the message matches v0 wording. */
const normalizeInvalidType = (
  issue: VetoIssueLike,
  rawInput: unknown,
  hasRawInput: boolean,
): VetoIssueLike => {
  const next: VetoIssueLike = { ...issue };

  if (typeof next.received !== 'string') {
    let fromInput: string;
    if (rawInput === null) {
      fromInput = 'null';
    } else if (Array.isArray(rawInput)) {
      fromInput = 'array';
    } else if (rawInput === undefined) {
      fromInput = 'undefined';
    } else {
      fromInput = typeof rawInput;
    }
    if (hasRawInput) {
      next.received = fromInput;
    }
  }

  if (typeof next.received !== 'string') {
    // Fallback for issues the error map didn't (or couldn't) annotate, e.g.
    // when a custom schema bypasses the global map. Parse the default Zod
    // v4 message: "Invalid input: expected X, received Y".
    const fromMessage =
      typeof next.message === 'string'
        ? /received\s+([a-z]+)/i.exec(next.message)?.[1]?.toLowerCase()
        : undefined;
    next.received = fromMessage ?? 'undefined';
  }

  if (
    typeof next.expected === 'string' &&
    next.expected === 'number' &&
    rawInput === ''
  ) {
    next.message = 'Field is required';
  } else if (
    typeof next.expected === 'string' &&
    typeof next.message === 'string' &&
    next.message.startsWith('Invalid input')
  ) {
    next.message = `Expected ${next.expected}, received ${stringifyForMessage(next.received)}`;
  }

  return next;
};

/**
 * too_small/too_big: normalize built-in size validator messages.
 *
 * String/array keep veto's v0 wording. Number keeps the Zod-style bound
 * wording, including when Zod falls back to the generic "Invalid input".
 * Preserves custom messages provided by the user.
 */
const normalizeTooSmallOrBig = (issue: VetoIssueLike): VetoIssueLike => {
  // `origin` is a Zod v4 field set by built-in min/max validators (string,
  // array, number, ...). Custom `ctx.addIssue` calls don't set it, in which
  // case we keep the user-provided issue untouched aside from message.
  const isFromBuiltinValidator = typeof issue.origin === 'string';
  const origin = isFromBuiltinValidator
    ? (issue.origin as string)
    : (issue.type as string);

  if (origin !== 'string' && origin !== 'array' && origin !== 'number') {
    return { ...issue };
  }

  const isTooSmall = issue.code === issueCodes.too_small;
  const hasV4DefaultMessage =
    typeof issue.message === 'string' &&
    (issue.message.startsWith('Too small') ||
      issue.message.startsWith('Too big') ||
      issue.message === 'Invalid input');

  const { origin: _origin, ...rest } = issue;
  const next: VetoIssueLike = { ...rest, type: origin };

  // Restore the v3 `exact` field (always `false` for `min`/`max`) so veto's
  // v0 issue contract continues to pass `toStrictEqual` checks.
  if (isFromBuiltinValidator) {
    next.exact = next.exact ?? false;
  }

  if (hasV4DefaultMessage) {
    const limit = isTooSmall
      ? stringifyForMessage(next.minimum)
      : stringifyForMessage(next.maximum);
    const direction = isTooSmall ? 'at least' : 'at most';
    if (origin === 'string') {
      next.message = `String must contain ${direction} ${limit} character(s)`;
    } else if (origin === 'array') {
      next.message = `Array must contain ${direction} ${limit} element(s)`;
    } else {
      let operator: string;
      if (isTooSmall) {
        operator = next.inclusive === false ? '>' : '>=';
      } else {
        operator = next.inclusive === false ? '<' : '<=';
      }
      next.message = `${isTooSmall ? 'Too small' : 'Too big'}: expected number to be ${operator}${limit}`;
    }
  }

  return next;
};

/**
 * Zod v4 collapses enums and literals into `invalid_value`. Restore the v0
 * codes (`invalid_enum_value` / `invalid_literal`) along with `received`.
 */
const normalizeInvalidValue = (
  issue: VetoIssueLike,
  metaInput: unknown,
): VetoIssueLike => {
  const values = issue.values as unknown[];
  const { values: _values, ...rest } = issue;

  if (values.length === 1) {
    const [expected] = values;
    const next: VetoIssueLike = {
      ...rest,
      code: 'invalid_literal',
      expected,
    };
    next.message ??= `Invalid literal value, expected ${stringifyForMessage(expected)}`;
    return next;
  }

  const next: VetoIssueLike = {
    ...rest,
    code: 'invalid_enum_value',
    options: values,
  };
  if (metaInput !== undefined) {
    next.received = metaInput;
  }
  if (!next.message) {
    const formattedOptions = values
      .map((v) => {
        return typeof v === 'string' ? `'${v}'` : stringifyForMessage(v);
      })
      .join(' | ');
    const formatReceived = (r: unknown) => {
      return typeof r === 'string' ? `'${r}'` : stringifyForMessage(r);
    };
    next.message =
      next.received === undefined
        ? `Invalid enum value. Expected ${formattedOptions}`
        : `Invalid enum value. Expected ${formattedOptions}, received ${formatReceived(next.received)}`;
  }

  return next;
};

/**
 * Normalizes Zod v4 `invalid_union` issues to veto's legacy-friendly shape.
 *
 * Handles three cases:
 * 1) Sentinel-driven "Field is required" issues: drop noisy transport fields.
 * 2) Raw discriminated-union "No matching discriminator" issues:
 *    - missing discriminator key -> "Field is required" + `received`.
 *    - invalid discriminator value present -> preserve message + add `received`.
 * 3) Raw invalid-union with empty branch details -> drop `errors: []`.
 */
const normalizeInvalidUnion = (
  issue: VetoIssueLike,
  rawInput: unknown,
): VetoIssueLike => {
  if (issue.message === 'Field is required') {
    const {
      errors: _errors,
      note: _note,
      discriminator: _discriminator,
      ...rest
    } = issue;
    return rest;
  }

  if (
    issue.note === 'No matching discriminator' &&
    typeof issue.discriminator === 'string'
  ) {
    const { discriminator } = issue;
    const inputObj =
      rawInput && typeof rawInput === 'object' && !Array.isArray(rawInput)
        ? (rawInput as Record<string, unknown>)
        : undefined;

    if (inputObj && inputObj[discriminator] === undefined) {
      const {
        errors: _errors,
        note: _note,
        discriminator: _discriminator,
        ...rest
      } = issue;
      return {
        ...rest,
        message: 'Field is required',
        received: 'undefined',
      };
    }

    if (
      inputObj?.[discriminator] !== undefined &&
      issue.received === undefined
    ) {
      const received = inputObj[discriminator];
      const formatReceived = (value: unknown) => {
        return typeof value === 'string'
          ? `'${value}'`
          : stringifyForMessage(value);
      };
      const { errors: branchErrors, ...rest } = issue;
      return {
        ...rest,
        message: `${issue.message}, received ${formatReceived(received)}`,
        ...(Array.isArray(branchErrors) && branchErrors.length > 0
          ? { errors: branchErrors }
          : {}),
        received,
      };
    }
  }

  if (Array.isArray(issue.errors) && issue.errors.length === 0) {
    const { errors: _errors, ...rest } = issue;
    return rest;
  }

  return issue;
};

/**
 * Adapts a Zod v4 issue to veto's v0 issue contract.
 *
 * Pairs with `errorMap.ts`:
 * 1. The error map encodes any v4-only fields we need (`received`, `options`,
 *    enum input value) into the message via {@link VETO_META_SENTINEL}.
 * 2. This function strips the sentinel, lifts the meta back onto the issue,
 *    and rewrites codes/messages so downstream consumers see the same shape
 *    they did with Zod v3.
 */
export const normalizeIssue = (issue: VetoIssueLike): VetoIssueLike => {
  // Step 1: decode sentinel metadata from the message and merge it back.
  const { message, meta } = extractMessageMeta(issue.message);
  const next: VetoIssueLike = { ...issue, message };
  // eslint-disable-next-line prefer-object-has-own
  const hasIssueInput = Object.prototype.hasOwnProperty.call(issue, 'input');
  const rawInput = hasIssueInput ? issue.input : undefined;
  if (meta.received !== undefined) {
    next.received = meta.received;
  }
  if (meta.options !== undefined) {
    next.options = meta.options;
  }

  // Step 2: compute a single "best available" input value for branches that
  // need to reconstruct legacy messages/codes (`invalid_value`, etc.).
  // Prefer real issue.input, then sentinel meta.input fallback.
  let metaInput: unknown;
  if (rawInput !== undefined || hasIssueInput) {
    metaInput = rawInput;
  } else if ('input' in meta) {
    metaInput = meta.input;
  } else {
    metaInput = undefined;
  }

  // Step 3: normalize by issue family. Order matters:
  // - specific code migrations first (`invalid_type`, size, keys, invalid_value)
  // - union/discriminated-union last (more stateful branching).
  if (next.code === issueCodes.invalid_type) {
    return normalizeInvalidType(next, rawInput, hasIssueInput);
  }

  if (
    (next.code === issueCodes.too_small && typeof next.minimum === 'number') ||
    (next.code === issueCodes.too_big && typeof next.maximum === 'number')
  ) {
    return normalizeTooSmallOrBig(next);
  }

  if (next.code === issueCodes.unrecognized_keys && Array.isArray(next.keys)) {
    const keyList = next.keys
      .map((k) => {
        return `'${stringifyForMessage(k)}'`;
      })
      .join(', ');
    return { ...next, message: `Unrecognized key(s) in object: ${keyList}` };
  }

  if (next.code === issueCodes.invalid_value && Array.isArray(next.values)) {
    return normalizeInvalidValue(next, metaInput);
  }

  if (next.code === issueCodes.invalid_union) {
    return normalizeInvalidUnion(next, rawInput);
  }

  return next;
};
