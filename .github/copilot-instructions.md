# Pull-request review instructions

Review changes as a compatibility-focused maintainer of an independently
released TypeScript package monorepo. Follow the nearest `AGENTS.md`.

Prioritize concrete defects over style commentary:

- public export, declaration, runtime, or peer-dependency regressions;
- dependency-direction violations or cross-package versioning omissions;
- missing tests for changed behavior and missing stories for component states;
- accessibility regressions in semantics, naming, focus, keyboard use, motion,
  contrast, or disabled/read-only behavior;
- generated files edited by hand or required generated output left stale;
- package contents that differ from what source imports made tests exercise;
- release, workflow, permission, credential, or provenance weaknesses.

Expect `pnpm check` to be the definition of done. Do not accept a green unit test
as evidence for a public package change when declarations, tarballs, consumer
installation, or Storybook behavior are relevant. Keep comments actionable,
cite the exact path and failure mode, and avoid speculative or cosmetic findings.
