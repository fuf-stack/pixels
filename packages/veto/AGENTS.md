# Veto package instructions

`@fuf-stack/veto` is a framework-independent validation API built on Zod. Keep
it independent of UI packages and treat inferred types as public API.

- Preserve input/output inference, normalized issue codes, serialized error
  shapes, and every symbol exported from `src/index.ts`.
- When Zod type usage changes, run `pnpm --filter @fuf-stack/veto build:zod` and
  commit the resulting `src/__generated__/zodTypes.ts` only if it changed.
- Add runtime tests and inference/declaration coverage for new validators or
  composition behavior. Keep `test/dts-smoke/fixture.ts` representative of the
  complete public API.
- Breaking schema or error-shape changes require migration documentation and an
  explicit breaking release plan.
- Run `pnpm --filter @fuf-stack/veto test`, its `test:dts` smoke test after a
  build, and `pnpm check` before review.
