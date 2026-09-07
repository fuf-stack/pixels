# Uniform package instructions

`@fuf-stack/uniform` provides React Hook Form components backed by Veto schemas
and Pixels UI primitives. Every path in `package.json#exports` is public.

- Preserve field names, value shapes, validation timing, error structures, and
  React Hook Form generic inference. Type regressions are API regressions.
- Keep schema logic in Veto and presentation primitives in Pixels. Uniform may
  depend on both; neither may depend on Uniform.
- A field change needs tests for registration, default/reset behavior, user
  updates, validation errors, disabled/read-only behavior where applicable, and
  a story for important states.
- Document migrations when serialized values, validation behavior, or exported
  types change.
- Run focused Vitest tests during development and `pnpm check` before review.
