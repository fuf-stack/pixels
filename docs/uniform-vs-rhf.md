# uniform vs react-hook-form

This document summarizes how `@fuf-stack/uniform` differs from using React Hook Form (RHF) directly.

## TL;DR

- uniform is built on top of RHF.
- uniform adds an opinionated field/component layer, validation integration, and UI-focused defaults.
- RHF still handles core form state, registration, and submission under the hood.

## What uniform changes compared to plain RHF

### 1) Field wiring is standardized through `useUniformField`

Instead of repeating `Controller` + label + invalid + error-message plumbing in every field component, uniform centralizes this logic in `useUniformField`.

It provides prewired helpers like:

- `field` handlers/value mapping
- `invalid` visibility behavior
- `errorMessage` rendering
- label/test-id helper props

### 2) Error rendering behavior is opinionated

uniform builds a prewired `errorMessage` node with `FieldValidationError`, and supports array-style error normalization through `isArrayValue` for components like `Select` and `Checkboxes`.

This reduces per-component error-shape handling while preserving compatibility for components that rely on structured nested errors.

### 3) Invalid-state timing is UX-oriented

uniform does not blindly show errors whenever RHF has an error.

By default, invalid UI is shown when the field is invalid and one of:

- dirty with a value
- touched
- form submitted

This avoids noisy "all red on first render" behavior for pristine forms.

### 4) Validation/schema integration is tighter

uniform integrates with project validation conventions (for example veto-backed flows) and exposes schema-aware metadata like `required` from field state, so components can render required indicators consistently.

### 5) Form context access is enhanced

uniform wraps RHF `useFormContext` and augments some behavior (for example field-state helpers and value conversion helpers used by the component layer).

In practice, consumers get RHF APIs plus uniform-specific conventions.

### 6) Field-array handling is abstracted (including flat arrays)

uniform provides dedicated field-array abstractions (`FieldArray`, `useUniformFieldArray`) for common list workflows:

- add/remove/insert/duplicate flows
- reorder/sort handling
- consistent test-id generation for element rows and nested fields
- support for both object arrays and flat-array value shapes

This removes a lot of repeated RHF `useFieldArray` plumbing in app code.

### 7) Reset behavior is coordinated across complex fields

uniform adds reset-aware wiring (for example via `useWatchFormReset` and related context notifications) so complex field types can normalize their internal UI state after programmatic resets.

This is especially relevant for:

- field arrays
- transformed field values
- components with display-vs-form value mapping

### 8) "Watch user change" behavior is explicitly supported

uniform includes dedicated support for user-change watchers (`useWatchUserChange`) so app flows can react to meaningful user-initiated value changes in a consistent way.

Compared to ad-hoc `watch(...)` subscriptions, this helps avoid repetitive edge-case logic around when a change should actually trigger follow-up behavior.

### 9) Client-side validation flow is integrated

uniform includes a client-validation layer (`useClientValidation`) to support interactive validation UX patterns beyond plain submit-time validation.

In practice this helps with:

- responsive cross-field validation feedback
- consistent validation triggering strategy
- keeping validation behavior aligned with the uniform component layer

### 10) Test-id and debug ergonomics are first-class

uniform standardizes field `testId` generation and can expose debug affordances (like copy test-id buttons) from the same field abstraction, so test selectors are more consistent across components.

## What uniform does not change

- RHF is still the underlying engine for registration, state tracking, and submit flow.
- You can still use RHF concepts (`control`, `Controller`, `getValues`, `watch`, etc.).
- RHF constraints and lifecycle semantics still apply; uniform is a higher-level layer, not a replacement runtime.
