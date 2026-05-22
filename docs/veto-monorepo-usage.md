# veto monorepo usage

## TL;DR

Add `@fuf-stack/veto` to your `package.json` and you're done — **do not**
add `zod`:

```json
"dependencies": {
  "@fuf-stack/veto": "^1.4.0"
}
```

veto declares `zod` as a regular `dependencies` entry, so pnpm installs
it transitively for any package that depends on veto. veto's
`dist/index.d.ts` inlines zod's type graph, so consumers' own
`tsc --build` emit never needs to resolve `zod` for type names either.

## Background — why this used to be a problem

Earlier veto releases (`<= 1.3.x`) declared `zod` as a `peerDependency`.
Under pnpm's strict-deps layout this required **every** package that
imported from `@fuf-stack/veto` to also declare `zod` directly,
otherwise `tsc --build` (or `tsdown`) raised `TS2742`/`TS2883` on any
exported veto-typed value:

```
src/index.ts:9:14 - error TS2883: The inferred type of 'xx'
cannot be named without a reference to 'ZodString' from
'.pnpm/zod@4.4.3/node_modules/zod'. This is likely not portable.
A type annotation is necessary.
```

The root cause was structural: zod's class identifiers (`ZodString`,
`ZodObject`, …) leaked through veto's inferred return types into every
consumer's emitted `.d.ts`. pnpm strict-deps then refused to anchor
those identifiers as bare specifiers because veto's `peerDependencies`
contract didn't give the consumer ownership of `zod`. The only working
fix was to add `zod` to the consumer's own `package.json` — across
every Tier-3/Tier-4 package — which defeated half the point of having a
wrapper library in the first place.

## The current solution (since v1.4)

veto runs `tsdown` in **two passes**: one for the runtime JS (zod stays
external) and one for the declaration file (zod's full type graph
inlined into `dist/index.d.ts`). This is the only configuration that
simultaneously satisfies all three of:

- portable consumer `.d.ts` emit (no `.pnpm/zod@…/…` references),
- a single zod runtime instance per process (so the global error map,
  zod's default locale, metadata registries, and
  `instanceof ZodType` checks all behave correctly),
- zero `zod` declarations in consumer `package.json` files.

The relevant pieces:

| File                                                 | What it does                                                                                                                                                                                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/veto/tsdown.config.ts` — pass 1            | Emit `dist/index.{mjs,js}` with `import { z } from 'zod'` left external. One shared zod instance at runtime.                                                                                                                                                     |
| `packages/veto/tsdown.config.ts` — pass 2            | `deps.alwaysBundle: [/^zod($\|\/)/]` + `dts: { emitDtsOnly: true }` — inline zod's types (incl. subpaths like `zod/v4/core`) into `dist/index.d.ts`, no JS emitted. `deps.onlyBundle` mirrors the regex so any other dep leaking into the .d.ts is a hard error. |
| `packages/veto/scripts/generate-zod-type-exports.ts` | Codegen step that walks zod via the TypeScript compiler API and writes `src/__generated__/zodTypes.ts` with one `export type { … } from '…'` line per leaky identifier family (see [Identifier families](#identifier-families) below). Re-runs every build.      |
| `packages/veto/package.json`                         | `zod` declared in `dependencies` (not `peer`, not `dev`). pnpm installs it transitively for any package that depends on veto.                                                                                                                                    |

The narrow re-export list (instead of `export type * from 'zod'`) is
deliberate: zod also exposes lowercase identifiers (`string`, `object`,
`record`, …) that veto re-uses as its own value-exports, and a wildcard
re-export causes rolldown to silently drop the colliding names from the
bundled `.d.ts`. The codegen script keeps the list in sync with the
installed zod version automatically — re-run `pnpm build:zod` (or just
`pnpm build`, which chains it) to refresh.

### Identifier families

zod 4 exposes three classes of identifier that can leak through veto's
inferred types. All three are handled by
`scripts/generate-zod-type-exports.ts`:

| Family   | Example                                      | Source module | Filter regex   |
| -------- | -------------------------------------------- | ------------- | -------------- |
| `Zod*`   | `ZodString`, `ZodObject`, `ZodOptional`      | `zod`         | `^Zod[A-Z]`    |
| `$Zod*`  | `$ZodIssueInvalidValue`, `$ZodTypeInternals` | `zod/v4/core` | `^\$Zod[A-Z]`  |
| `_$Zod*` | `_$ZodType`, `_$ZodTypeInternals`            | `zod/v4/core` | `^_\$Zod[A-Z]` |

Veto's _own_ exports that appear in public signatures (e.g.
`VDiscriminatedUnionOptions`) must be declared with `export` in the
source file — the codegen only handles zod's identifiers.

## Why JS is not bundled

An earlier iteration force-bundled zod's runtime JS into
`dist/index.mjs` via the same `deps.alwaysBundle: ['zod']` switch. That
solved the consumer-install ergonomics, but it produced a **second
physical zod instance** inside veto, and every piece of process-global
zod state broke quietly:

- `vetoErrorMap` was registered on the bundled zod's globals, so the
  fallback for issue codes the map didn't override (`too_small`,
  `too_big`, …) hit the bundled instance's missing default locale and
  surfaced as `"Invalid input"` instead of the expected
  `"Array must contain at least 2 element(s)"`.
- `instanceof z.ZodType` against a raw-zod import returned `false`.
- A consumer's own `z.config({ … })` silently affected only the outer
  zod, never the bundled one.
- `.meta()` written via raw zod did not show up on veto schemas.

Inlining only the types preserves the portable `.d.ts` win without any
of these breakages: one zod copy, one set of globals, one prototype
chain.

## Verified consumer experience

Tested in [`tests/veto-monorepo-testing`](https://github.com/...)
against `tsc --build` with pnpm 11 and TypeScript 6:

- `ex-validator` (re-exports veto and adds a local schema)
- `ex-types` (composes schemas from `ex-validator`)

Both build with **zero** `zod` declarations anywhere in the consumer
dep trees and produce `.d.ts` outputs with **zero**
`import … from 'zod'` statements.

## When TS4023 still fires

If `tsc --build` in a consumer raises something like:

```
error TS4023: Exported variable 'X' has or is using name 'ZodFoo' from
external module '…/@fuf-stack/veto/dist/index' but cannot be named.
```

…something is leaking through veto's API surface that the codegen
didn't re-export. Three possibilities, in order of likelihood:

1. **A new identifier in one of the existing zod families** — just
   regenerate: `pnpm --filter @fuf-stack/veto build:zod`. The script
   walks zod's modules on every build, so a brand-new `Zod*` /
   `$Zod*` / `_$Zod*` is picked up automatically.
2. **A new identifier family in zod** — widen the relevant filter
   regex in `scripts/generate-zod-type-exports.ts` (`ZOD_NAME_RE` /
   `ZOD_CORE_NAME_RE`) or, if the family lives in a new subpath, add
   another `collectExports(…)` call and update the [Identifier
   families](#identifier-families) table above.
3. **A veto-owned identifier without `export`** (like the historical
   `VDiscriminatedUnionOptions` regression) — the leaked name will
   _not_ start with `Zod` / `$Zod` / `_$Zod`. Add the missing `export`
   in veto's source file. The codegen does not and cannot fix this.

CI guards:

- `packages/veto/test/dts-smoke/` is a tiny declaration-emit fixture
  that imports `@fuf-stack/veto` (mapped to the _built_ `dist/index.d.ts`)
  and `export`s the inferred result of every public API. Run via
  `pnpm turbo test:dts` after `pnpm build`; any TS4023 surfaces here
  before it can reach a consumer. When you add or change a public API,
  add a matching line to `fixture.ts`.
- `git diff --exit-code packages/veto/src/__generated__` after
  `pnpm build` flags any drift between the committed snapshot of the
  `Zod*` / `$Zod*` / `_$Zod*` re-exports and the installed zod version.

## Mixing raw zod and veto

Because veto leaves zod's runtime external, raw `zod` and
`@fuf-stack/veto` **share the same physical zod instance** at runtime
(pnpm resolves both imports to the one copy under
`node_modules/.pnpm/zod@…`). Integrations like
`@hookform/resolvers/zod`, `drizzle-zod`, and `zod-to-openapi` work
transparently on veto-built schemas — they all operate on the same
`ZodType` prototype chain.

Two things to keep in mind:

1. **Do not add `zod` to a consumer's `dependencies`.** Let pnpm
   resolve it via veto's transitive `dependencies` entry. Adding a
   second declaration can pin a different version and produce a
   duplicate physical instance. If a non-veto package absolutely
   requires a specific zod version, use a `pnpm.overrides` entry in
   the workspace root to force a single resolved version.
2. The zod version that ships with veto is the one veto's test suite
   ran against — see `packages/veto/package.json:dependencies.zod`.
   Overriding it to a newer zod is allowed but unsupported.

## See also

- [pnpm overrides guide](./pnpm-overrides.md)
- [tsdown bundling notes](./tsdown-bundling.md)
- [veto v1 upgrade](./veto-v1-upgrade.md)
