#!/usr/bin/env bash
#
# Declaration-emit smoke test for veto's bundled `dist/index.d.ts`.
#
# Runs `tsc -p test/dts-smoke` against a fixture that imports veto via
# its public package entry and `export`s the inferred result of every
# public API. If any symbol in the inferred chain is not nameable from
# `@fuf-stack/veto`, tsc raises `TS4023` here — before any consumer ever
# sees it.
#
# Assumes `dist/index.d.ts` is up-to-date. The Makefile `test-dts`
# target and the workspace `pnpm build` step both ensure that.
#
# Exit codes:
#   0 — fixture compiled cleanly, no TS4023 leaks
#   non-zero — tsc found problems (full output already printed above)
#
# See: docs/veto-monorepo-usage.md ("When TS4023 still fires").

set -euo pipefail

# Resolve paths relative to this script so the command works no matter
# where it's invoked from (pnpm script, Makefile, CI step).
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$(dirname -- "${SCRIPT_DIR}")"
FIXTURE_DIR="${PKG_DIR}/test/dts-smoke"

cd "${PKG_DIR}"

if ! pnpm exec tsc -p "${FIXTURE_DIR}"; then
  cat <<'EOF' >&2

[test:dts] FAILED — TS4023 (or related) leak in dist/index.d.ts.

A symbol referenced in veto's public API surface is not exported by
name from `@fuf-stack/veto`. Likely causes, in order:

  1. A new zod identifier in an existing family (Zod* / $Zod* / _$Zod*)
     not yet in the codegen snapshot. Run:
         pnpm --filter @fuf-stack/veto build:zod
     and commit the diff in `src/__generated__/zodTypes.ts`.

  2. A new identifier family in zod (e.g. a future `@Zod*` prefix) —
     widen the relevant regex in
         packages/veto/scripts/generate-zod-type-exports.ts.

  3. A veto-owned identifier declared without `export` (the leaked
     name will not start with `Zod` / `$Zod` / `_$Zod`). Add the
     missing `export` to the source declaration.

See: docs/veto-monorepo-usage.md ("When TS4023 still fires").
EOF
  exit 1
fi

echo "[test:dts] PASSED — dist/index.d.ts: no TS4023 leaks in public API surface"
