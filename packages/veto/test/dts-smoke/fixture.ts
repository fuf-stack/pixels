/* eslint-disable import-x/no-namespace */

/**
 * dts-smoke fixture.
 *
 * Forces TypeScript to compute the full inferred-type chain for every
 * public veto API and write it into an emitted `.d.ts`. If any symbol
 * in that chain isn't `export`ed by `@fuf-stack/veto`, tsc raises
 * `TS4023` here — before any consumer ever sees it.
 *
 * Coverage rule: when you add or change a public API in veto, add a
 * matching `export const _foo = v.foo(...)` line below. Prefer real
 * compositions (`v.object({ a: v.string() })`) over single calls — the
 * leaky identifiers (`$Zod*`, `_$Zod*`, …) usually only surface once
 * the inferred chain is at least one level deep.
 *
 * Intentionally imports from the **package name**, not a relative path
 * into `src/`. Resolved via the workspace symlink to the *built*
 * `dist/index.d.ts`, so this exercises what consumers actually see.
 *
 * See: docs/veto-monorepo-usage.md ("When TS4023 still fires").
 */
import * as v from '@fuf-stack/veto';

// --- primary factories ------------------------------------------------------

export const _string = v.string();
export const _stringWithOptions = v.string({ min: 0 });
export const _number = v.number();
export const _boolean = v.boolean();
export const _any = v.any();
export const _literal = v.literal('a');
export const _nativeEnum = v.nativeEnum({ A: 'a', B: 'b' } as const);
export const _vEnum = v.vEnum(['a', 'b'] as const);
export const _json = v.json();
export const _jsonObject = v.jsonObject();

// --- composition ------------------------------------------------------------

export const _object = v.object({ a: v.string(), b: v.number() });
export const _objectLoose = v.objectLoose({ a: v.string() });
export const _array = v.array(v.string()).min(2);
export const _record = v.record(v.string());
export const _and = v.and(
  v.object({ a: v.string() }),
  v.object({ b: v.number() }),
);

// --- discriminated union ---------------------------------------------------
//
// Both arities matter:
//   - 2-arg form pulls in `$ZodDiscriminatedUnion*` and `$ZodIssue*`
//   - 3-arg form is what surfaces `VDiscriminatedUnionOptions`

export const _discriminatedUnion = v.discriminatedUnion('kind', [
  v.object({ kind: v.literal('a'), a: v.string() }),
  v.object({ kind: v.literal('b'), b: v.number() }),
]);

export const _discriminatedUnionWithOptions = v.discriminatedUnion(
  'kind',
  [
    v.object({ kind: v.literal('a'), a: v.string() }),
    v.object({ kind: v.literal('b'), b: v.number() }),
  ],
  { unionFallback: true },
);

// --- veto() wrapper --------------------------------------------------------
//
// Builds a non-trivial validator that combines everything above, so the
// inferred `VetoInstance` type pulls in the whole chain at once.

export const _validator = v.veto({
  s: v.string(),
  n: v.number(),
  arr: _array,
  obj: _object,
  du: _discriminatedUnion,
  duOpt: _discriminatedUnionWithOptions,
});

// --- the combined object that mirrors the original failure mode ------------
//
// The original consumer failure was:
//   `const typesExtended = { ... } // TS4023 on $ZodIssueInvalidValue, …`
// Re-create that shape so the regression is exercised end-to-end.

export const typesExtended = {
  string: v.string,
  number: v.number,
  boolean: v.boolean,
  array: v.array,
  object: v.object,
  record: v.record,
  discriminatedUnion: v.discriminatedUnion,
  veto: v.veto,
};
