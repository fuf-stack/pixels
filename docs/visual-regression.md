# Storybook visual regression

Visual comparisons reuse selected Storybook stories and run in light and dark
themes. They complement interaction and accessibility tests, they do not replace
them. Coverage grows with meaningful visual states rather than the story count.

## Which stories get visual coverage

Tag a story when its final rendered state protects a distinct appearance that
interaction assertions would not catch. Do not tag every story automatically.
Every public component with a rendered surface needs at least one representative
baseline. A gallery or composition can serve as that baseline, it does not have
to be a story named Default. Add further states where the layout or styling
changes materially:

| Story kind   | Capture when                                                           | Example                                 |
| ------------ | ---------------------------------------------------------------------- | --------------------------------------- |
| Normal usage | It establishes the component's representative appearance               | Input with label                        |
| Variants     | A compact gallery covers different colors, sizes or shapes             | Alert variants, Switch sizes            |
| State        | Selection, focus, disabled or validation changes the visible treatment | Selected table rows, invalid TextArea   |
| Composition  | Wrapping, slots or custom styling could regress independently          | Multiline Alert, custom Avatar slots    |
| Overlay      | The open surface, positioning or backdrop is the contract              | Open Select and Tooltip, Modal backdrop |
| Responsive   | A specific width exposes overflow or a different arrangement           | Narrow DataTable                        |
| Edge case    | The unusual data has a meaningful visible result                       | DataTable empty after filtering         |

Reuse one gallery instead of capturing each equivalent variant separately. Add a
second story only for an appearance it does not cover. For example, a default
Switch adds little beside the size gallery, while its disabled treatment does.
A callback-only story, value-transform example or repeated prop combination
usually needs interaction assertions rather than another PNG. An interaction
that closes or removes the component also needs a separate stable open-state
story if the visible surface is what should be protected.

Use fixed data, local assets and explicit dates/time zones. Avoid live requests,
relative dates and random values. Let `play` establish and assert the state before
capture; screenshots record the final state, not every intermediate interaction.
For example, TextArea's autosizing story clears its content at the end, so tag a
populated multiline story to protect the expanded layout instead. Keep focus
visible when that is the state under test. Inspect the initial PNG to confirm the
intended state is actually captured, a passing `play` assertion alone does not
prove that focus or selection remains in that state afterward. Prefer a stable
state story if an interaction returns to the initial appearance. Do not tag an
animation until it has a deterministic resting state.

The [coverage inventory](./visual-coverage.md) lists selected stories by component
across Pixels, Uniform, Megapixels and Atelier, plus the explicit exceptions for
APIs without their own rendered surface. Use it when reviewing a new component,
and update it whenever stories are added to or removed from visual coverage.

When adding or changing a component, review the table above and add or update the
smallest set of stories that protects its distinct appearances. New public visual
components need a baseline in the same change. For a behavior-only API, document
which visual component or composition covers its output instead. Both themes run
automatically, do not create separate light/dark story copies.

## Run and review

Run only the visual category, including dependency setup, workspace builds and a
fresh static Storybook build:

```sh
make test-visual
```

`make test` runs unit tests followed by parallel Storybook browser tests. It does
not launch Playwright screenshot comparisons. `make check` likewise leaves visual
comparisons to the dedicated command and CI job.

For an already installed workspace, run the underlying commands directly.

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

## Tag an existing story

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

Declare `tags: ['visual']` explicitly on each selected story, including stories
that spread another story. The static index does not infer inherited tags from
object spreads. The shared runner discovers tagged stories from the built
Storybook index.
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
