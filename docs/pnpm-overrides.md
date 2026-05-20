# pnpm overrides guide

This document explains how `pnpm` `overrides` are used in this repository.

## What overrides do

`overrides` force dependency versions across the entire workspace, including transitive dependencies.

That means if multiple packages request different versions of the same dependency, pnpm resolves them to the version declared in `overrides`.

Docs:

- https://pnpm.io/settings#overrides

## Where we configure them

Repository-wide overrides are defined in:

- `pnpm-workspace.yaml`

## Why we use them

We use overrides as a safety rail when dependency version drift can cause instability (for example type identity mismatches, duplicate runtime copies, or build-tooling conflicts).

## When to add an override

- A dependency must stay single-version across the workspace.
- A transitive upgrade introduces duplicate versions and breaks builds/types.
- You need a temporary guardrail during migrations.

## Trade-offs

- Overrides can hide semver conflicts that would otherwise be visible.
- They may surprise downstream consumers if published package expectations differ.
- They require periodic review and cleanup.

## Recommended workflow

1. Prefer fixing direct dependency declarations first.
2. Add an override only when necessary for workspace consistency.
3. Keep the override Renovate-managed.
4. Revisit and remove stale overrides once upstream ranges align.

## See also

- [tsdown bundling notes](./tsdown-bundling.md)
