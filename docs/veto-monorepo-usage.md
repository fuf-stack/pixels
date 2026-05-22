# veto monorepo usage

## TL;DR

Add `@fuf-stack/veto` to your `package.json` and you're done — **do not**
add `zod`:

```json
"dependencies": {
  "@fuf-stack/veto": "^1.4.0"
}
```

veto bundles zod (both runtime and types) into its own `dist`, so
consumers do not need `zod` resolvable in their own `node_modules` for
either runtime or TypeScript declaration emit.

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

veto's `tsdown.config.ts` uses `deps.alwaysBundle: ['zod']` to inline
zod's full type graph and runtime into `dist/index.{mjs,js,d.ts}`. The
relevant pieces:

| File                             | What it does                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/veto/tsdown.config.ts` | `deps.alwaysBundle: ['zod']` forces zod to be bundled into both JS and `.d.ts` outputs                                                                                    |
| `packages/veto/src/index.ts`     | Explicit `export type { ZodAny, ZodArray, ZodString, … } from 'zod'` for the capitalized class types so consumers can name them when they appear in inferred return types |
| `packages/veto/package.json`     | `zod` lives only in `devDependencies` — it's needed at build time only                                                                                                    |

The narrow re-export list (instead of `export type * from 'zod'`) is
deliberate: zod also exposes lowercase identifiers (`string`, `object`,
`record`, …) that veto re-uses as its own value-exports, and a wildcard
re-export causes rolldown to silently drop the colliding names from the
bundled `.d.ts`.

## Verified consumer experience

Tested in [`tests/veto-monorepo-testing`](https://github.com/...)
against `tsc --build` with pnpm 11 and TypeScript 6:

- `ex-validator` (re-exports veto and adds a local schema)
- `ex-types` (composes schemas from `ex-validator`)

Both build with **zero** `zod` declarations anywhere in the dep tree
and produce `.d.ts` outputs with **zero** `import … from 'zod'`
statements.

## When TS4023 still fires

If `tsc --build` in a consumer raises something like:

```
error TS4023: Exported variable 'X' has or is using name 'ZodFoo' from
external module '…/@fuf-stack/veto/dist/index' but cannot be named.
```

…it means veto's API surface exposes a zod class (`ZodFoo`) that isn't
yet in the re-export list at `packages/veto/src/index.ts`. The fix is
one line:

```ts
// packages/veto/src/index.ts
export type {
  // …existing entries…
  ZodFoo,
} from 'zod';
```

Rebuild veto, publish a patch, done. This is now the only maintenance
surface for the "consumer can't name a zod type" problem.

## Hard constraint — don't mix raw zod with veto in the same codebase

Because veto inlines zod's types and runtime, importing raw `zod` in a
consumer that also uses veto creates **two structurally identical but
nominally distinct** copies of every zod class:

- `import { string } from '@fuf-stack/veto'` — returns inlined-`ZodString`
- `import { z } from 'zod'` — returns raw-`ZodString`

These are not assignable to each other (zod 4 schemas have private
fields, making them nominal). Any library that wants a zod schema by
type (`@hookform/resolvers/zod`, `drizzle-zod`, `zod-to-openapi`, …)
will only accept one flavor. **Pick veto or raw zod for a given
codebase, never both.**

The fuf monorepo and all internal consumer projects use veto
exclusively. If a future consumer needs an integration that only
accepts raw-zod schemas, the migration path is:

1. Add `zod: "4.4.3"` to that consumer's `dependencies` (matching
   the version veto was tested against — see
   `packages/veto/devDependencies.zod`).
2. That consumer now sees both flavors. Use raw zod **only** for the
   third-party integration that demands it; keep veto everywhere else.
3. Accept that TS2742 may return for any veto schemas exported from
   that specific consumer.

## See also

- [pnpm overrides guide](./pnpm-overrides.md)
- [tsdown bundling notes](./tsdown-bundling.md)
- [veto v1 upgrade](./veto-v1-upgrade.md)
