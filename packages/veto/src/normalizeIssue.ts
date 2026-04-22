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
 * The sentinel is needed because Zod v4 strips fields like `input` from the
 * public issue. Anything we want to preserve has to round-trip through the
 * message.
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
const normalizeInvalidType = (issue: VetoIssueLike): VetoIssueLike => {
  const next: VetoIssueLike = { ...issue };

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
    typeof next.message === 'string' &&
    next.message.startsWith('Invalid input')
  ) {
    next.message = `Expected ${next.expected}, received ${stringifyForMessage(next.received)}`;
  }

  return next;
};

/**
 * too_small/too_big: restore v0 wording for string and array origins.
 *
 * Only rewrites the message when it is still Zod v4's default ("Too small"/
 * "Too big" prefix); preserves any custom message provided by the user.
 */
const normalizeTooSmallOrBig = (issue: VetoIssueLike): VetoIssueLike => {
  // `origin` is a Zod v4 field set by built-in min/max validators (string,
  // array, number, ...). Custom `ctx.addIssue` calls don't set it, in which
  // case we keep the user-provided issue untouched aside from message.
  const isFromBuiltinValidator = typeof issue.origin === 'string';
  const origin = isFromBuiltinValidator
    ? (issue.origin as string)
    : (issue.type as string);

  if (origin !== 'string' && origin !== 'array') {
    return { ...issue };
  }

  const isTooSmall = issue.code === issueCodes.too_small;
  const hasV4DefaultMessage =
    typeof issue.message === 'string' &&
    (issue.message.startsWith('Too small') ||
      issue.message.startsWith('Too big'));

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
    } else {
      next.message = `Array must contain ${direction} ${limit} element(s)`;
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
  // Lift any meta the global error map smuggled through the message.
  const { message, meta } = extractMessageMeta(issue.message);
  const next: VetoIssueLike = { ...issue, message };
  if (meta.received !== undefined) {
    next.received = meta.received;
  }
  if (meta.options !== undefined) {
    next.options = meta.options as unknown[];
  }
  const metaInput = 'input' in meta ? meta.input : undefined;

  if (next.code === issueCodes.invalid_type) {
    return normalizeInvalidType(next);
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

  // invalid_union: trim the noisy v4 fields when our error map already
  // surfaced "Field is required" via the sentinel.
  if (
    next.code === issueCodes.invalid_union &&
    next.message === 'Field is required'
  ) {
    const {
      errors: _errors,
      note: _note,
      discriminator: _discriminator,
      ...rest
    } = next;
    return rest;
  }

  return next;
};
