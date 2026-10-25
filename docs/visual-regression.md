# Storybook visual regression pilot

The pilot compares screenshots of existing Button, Input, Select, Modal and
DataTable stories. It complements interaction and accessibility tests, and does
not replace them. Nine states run in light and dark themes: button colors,
disabled and keyboard focus, an input label and validation error, an open select,
an open modal, selected table rows and a narrow table viewport.

## Run and review

Build the workspace first if its published packages have changed:

```sh
pnpm build
pnpm --filter @repo/storybook-config storybook:build
pnpm test:visual:docker
```

Docker runs Chromium and the test runner in the same pinned Linux arm64 Playwright
image as CI, which uses `ubuntu-24.04-arm`. The static Storybook server runs
inside the container on port 6008, without publishing a host port. Docker must be
running. The command uses the workspace's installed Playwright version, so it
does not download a separate runner inside the container. Use Apple Silicon or
an ARM Linux host for native rendering, x64 hosts need working ARM emulation.

`pnpm test:visual` runs directly in the current environment and is intended for
the CI container. Use the Docker command on macOS to compare and update the Linux
baselines. Other operating systems and browser versions can render different pixels.

CI has a separate **Visual regression pilot** job. Its artifact contains the HTML
report, failure traces, and expected/actual/difference images. Download and extract
`visual-regression-report`, then serve its extracted `playwright-report` folder:

```sh
pnpm --filter @repo/storybook-config exec playwright show-report /absolute/path/to/playwright-report
```

For a local run, omit the path to open the package's latest report. A missing
baseline fails the check, just like an unexpected visual change.

## Update a baseline

After inspecting a difference and confirming the intended appearance:

```sh
# Update one state in both themes
pnpm test:visual:docker --update-snapshots --grep 'uniform-input--invalid$'

# Verify it again without update mode
pnpm test:visual:docker
```

Review the changed PNGs under
`packages/<package>/src/<Component>/__snapshots__/visual/` and include them with the
component change. Do not update baselines just to make CI green. Reports,
traces, actual/difference images and the built Storybook are ignored generated
files; only approved baseline PNGs belong in Git.

## Extend the pilot

Reuse stories rather than adding separate component visual test files. Add the
`visual` tag to a story and declare its capture settings in `parameters.visual`:

```tsx
export const Invalid: Story = {
  args,
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="input"]' },
  },
  // keep the interaction and assertions in the existing play function
};
```

The shared runner discovers tagged stories from the built Storybook index.
Rebuild with `pnpm --filter @repo/storybook-config storybook:build` after adding a
tag or changing a story. Baseline names follow the story ID's final segment, for example `invalid.png`:

```text
Input/
  Input.test.tsx
  stories/
    Input.stories.tsx
  __snapshots__/
    Input.test.tsx.snap
    visual/
      dark/invalid.png
      light/invalid.png
```

The runner waits for the story's resolved settings, applies its viewport, then
releases a test-only loader so rendering and `play` execute at the correct size.
It requires Storybook's successful `storyFinished` event, waits for fonts, and
uses fixed locale/time zone, device scale and reduced motion. Normal Storybook
browsing and its interaction tests do not wait for this visual-test handshake.

The default rendering viewport is 1280 × 900. Override it per story when layout
at a particular size matters:

```tsx
parameters: {
  visual: {
    target: '[data-component="data-table"]',
    viewport: { width: 390, height: 844 },
  },
},
```

The viewport controls layout, not PNG dimensions. Captures crop to the union of
matching elements with 16px padding for focus rings and shadows. Bounds are
clipped at the viewport edge, so narrow tables still check horizontal overflow.
For a portaled select menu, target both elements:

```tsx
visual: { target: '[data-component="select"], [role="listbox"]' },
```

When backdrop and placement matter, capture the viewport instead:

```tsx
visual: { capture: 'viewport' },
```

Use either `target` or `capture: 'viewport'`. Both support an optional `viewport`.
Screenshot comparisons disable animations and hide the caret. Keep the baseline
PNGs with the component owning the source `stories/` folder; shared configuration,
serving and reporting stay in the tooling package.

No pixel differences are allowed in this initial pilot. If a case proves unstable,
fix its data, animation or readiness condition before considering a narrowly
justified tolerance. Avoid masking the component being tested.

The Docker helper reads the image directly from the CI workflow's `visual-tests`
job. Change the pin there, there is no separate local image pin to update.
Renovate groups `playwright`, `@playwright/test`, `playwright-core` and the official
Playwright image into one **Playwright runtime** update PR. Review the proposed
versions together, regenerate baselines when needed and inspect the differences.

[Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) ·
[Playwright Docker environment](https://playwright.dev/docs/docker) ·
[Story workflows](./agent-workflows.md#storybook-stories-and-edge-cases)
