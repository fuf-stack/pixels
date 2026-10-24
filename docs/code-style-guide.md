# Code style guide

Write code so readers can follow its intent from top to bottom. Apply these
conventions to new and changed code alongside the root and package `AGENTS.md`
instructions and the repository's ESLint and Prettier configuration.

## Keep each step easy to follow

Use descriptive intermediate variables when nested calls, transformations, or
conditions make a call or return object harder to read. Keep simple expressions
inline; avoid introducing variables that only repeat an existing name.

```ts
const validationInput = omitDisabledValues(validationValues, disabledFields);
const result = await validation.validateAsync(validationInput);

// Schema defaults can restore disabled values, so filter the output too.
const submissionValues = omitDisabledValues(result.data ?? {}, disabledFields);

return {
  errors: result.errors ?? {},
  values: submissionValues,
};
```

Move large schemas and conditional configuration out of JSX into named
variables. In tests, separate the operation being tested from its assertion
when combining them would hide the sequence.

## Order return properties alphabetically

List properties in returned objects alphabetically so readers can find them
consistently. Match that order in expected result objects where practical.
Compute values before the return when their expressions need explanation.

Do not reorder spreads or expressions when doing so would change override
precedence or evaluation behavior. Refactor those cases explicitly first.

## Separate logical stages

Use blank lines between setup, transformations, validation, and returned
results. Keep closely related statements together. Add a short comment when
the transition or ordering has a non-obvious reason.

Prefer a direct expression for a simple callback. Use a block when it contains
multiple steps or needs an explanatory comment, following the lint rules for
that file.

## Preserve useful explanations

Keep comments that explain intent, constraints, lifecycle ordering, or edge
cases. Update them when behavior changes. Avoid comments that merely restate
the next line of code.

When relying on a dependency's internal API, explain why it is needed and what
must be checked when upgrading the dependency. Keep that explanation near the
access rather than scattering it across callers.

Review larger docstrings whenever responsibilities or behavior change. Describe
the current implementation, including important caveats, while preserving
still-relevant context. Do not expand unrelated documentation just because the
file is being edited.

For public props, use the repository's active-verb JSDoc convention: describe
what the prop does, identify callback triggers, and include useful defaults or
fallbacks. See the root `AGENTS.md` for the full convention.

## Keep cleanup focused

Prefer small local improvements over new abstractions for a single expression.
Preserve runtime behavior, public types, and helpful comments during readability
changes. Run focused tests and the checks required by the repository; do not
weaken lint rules or assertions to accommodate a refactor.
