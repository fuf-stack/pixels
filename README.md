# Pixels

Pixels is a pnpm monorepo for independently released React UI, form,
validation, motion, and utility packages published under `@fuf-stack`.

| Package        | Responsibility                                                |
| -------------- | ------------------------------------------------------------- |
| `pixel-utils`  | Shared styling and small framework utilities                  |
| `pixel-motion` | Shared motion primitives                                      |
| `pixels`       | Base React components and hooks                               |
| `veto`         | Framework-independent validation built on Zod                 |
| `uniform`      | Form components integrating Pixels, Veto, and React Hook Form |
| `atelier`      | Application-shell and rendering utilities                     |
| `megapixels`   | Higher-level data and application components                  |

Private packages in `packages/config` contain shared build, Vite, Tailwind, and
Storybook configuration. Dependency direction and package-specific conventions
are documented in [`AGENTS.md`](./AGENTS.md).

## Development

Use the Node and pnpm versions declared in `.nvmrc` and `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

The common definition of done is:

```sh
pnpm check
```

It validates dependency boundaries, linting, declaration-producing package
builds, unit tests, Storybook browser tests, published tarball contents, and a
clean consumer installation of every published package. All checks run even if
an earlier one fails; the final exit status is non-zero if any check failed.
CI runs the same stages as separate jobs so linting, unit tests, Storybook, and
package smoke tests can execute in parallel.

Install Chromium once before the first local Storybook run:

```sh
pnpm exec playwright install chromium
```

Project documentation lives in [`docs/`](./docs/). Start with the
[agent workflows](./docs/agent-workflows.md) for common change types and the
[release workflow](./docs/package-release-workflow.md) for publishing.

## License

This project is licensed under the MIT License; see [`LICENSE`](./LICENSE).
