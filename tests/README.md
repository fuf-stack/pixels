# Package integration tests

These fixtures exercise the published Pixels packages from a consumer application's point of view. Run the checks from the repository root:

```sh
pnpm build
pnpm verify:packages
```

The [verification script](../scripts/verify-packages.mjs) packs the build output into tarballs, installs them in a temporary consumer project, and copies the fixtures there to run it.

## Vite class helpers

The [plain Vite fixture](fixtures/vite-class-helpers/vite.config.mjs) builds a small ES module using the Tailwind and Pixels plugins. The verifier imports the built module and checks that both `cn` and `tv` replace a default font size with `text-caption` while preserving `text-brand`. The fixture imports its tokens through a Vite alias and resets the default font sizes. It checks that `text-sm` still applies the project color alongside `text-body`, and verifies the compiled CSS.

## Astro class helpers

The [Astro fixture](fixtures/astro-class-helpers/) configures `@fuf-stack/pixels-theme/vite` with the app's CSS entry. The verifier builds the Astro page and checks its generated HTML across three uses of the same theme:

- The page uses `cn` to replace a default font size with `text-body` while preserving the text color.
- A React island uses `tv` and passes project classes to a Pixels Button. The custom size replaces the button's default size, and the brand color survives.
- The page combines a custom prose size and color. The [typography stylesheet](fixtures/astro-class-helpers/src/typography.css) declares which merge group the prose size belongs to.
