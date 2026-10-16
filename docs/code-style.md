# Code style guide

First draft. This guide records the readability and component-structure decisions
that ESLint and Prettier do not fully enforce. Apply it to new code and focused
refactors; older code is not automatically a counterexample or a request for a
repository-wide rewrite. Explicit maintainer feedback takes precedence over an
older example.

Use this guide alongside:

- [Component styling](./styling.md) for Tailwind Variants, slots, consumer class
  merging, tokens and CSS packaging.
- [Agent and maintainer workflows](./agent-workflows.md) for verification,
  accessibility and change management.
- The root and nearest package `AGENTS.md` for architecture and public API rules.

The current [Uniform Input](../packages/uniform/src/Input/Input.tsx) is a concrete
reference for the structure below. Examples here are intentionally small excerpts,
not complete component implementations.

## Readability before compactness

Use blank lines to separate setup, state, handlers and rendering. Keep related
statements together, and leave a blank line before the return.

Comments are optional. Add a short one for timing, a constraint or a surprising
choice. Skip comments that repeat the function name or narrate obvious code.
Whitespace is often enough. Write explanatory `//` comments in lowercase, without
a trailing full stop. Use a comma rather than a semicolon between related phrases.
Section banners and proper names keep their normal capitalization.

```tsx
const { field } = useUniformField(options);

// debounce form updates, flush pending edits on blur
const { value, onChange, onBlur, clear } = useInputValueDebounce({
  name,
  emptyValue: '',
  value: field.value,
  onChange: field.onChange,
  onBlur: field.onBlur,
});

return (
  <InputControl
    onClear={onClear}
    onReset={clear}
    onValueChange={onChange}
    value={value}
  />
);
```

Keep a related object such as `field` intact when nested destructuring and aliases
make the data flow harder to follow. `field.value` and `field.onChange` explain
where the values come from without requiring the reader to remember aliases.

Put forwarded props first, followed by explicit overrides in alphabetical order.
Spread order controls precedence, so preserve intentional overrides when reordering.

```tsx
const fieldState = useUniformField({
  ...uniformProps,
  ariaLabel,
  name,
  type,
});
```

Keep independent hooks in the first block of the component body, before prop
destructuring and derived values. Destructure props earlier only when a hook
needs them. Keep every hook unconditional and before early returns.

```tsx
const InputControl = (props: InputControlProps) => {
  const styling = useStyling();
  const { focusProps, isFocused } = useFocusRing({ within: true });

  const { className, value, ...fieldProps } = props;

  // ...
};
```

## Component files and responsibility

Keep the main prop interface in the component's own file. Subcomponents own their
prop interfaces too. Do not introduce a separate `<Component>.types.ts` merely to
move the component's main prop definition out of sight.

Use a named props interface above the component, including small subcomponents.
Keep the destructured parameter list free of inline type definitions:

```tsx
interface InputClearButtonProps {
  /** CSS class name */
  className: string;
  /** Callback when the clear button is activated */
  onClear: () => void;
}

const InputClearButton = ({ className, onClear }: InputClearButtonProps) => {
  // ...
};
```

Private components belong in a `subcomponents/` folder under their owner. Give
each an identifiable job, especially around React Aria composition. The main
component should read as an orchestration of those jobs, rather than containing
every field engine, addon, icon and action inline.

Reuse between related components does not change ownership. Keep a family-specific
subcomponent under its primary owner, with its recipes and tests beside it, and
import it directly from sibling components. Reserve `partials/` for presentation
shared across field families, such as `FieldLayout`, `FieldLabel` and
`FieldValidationError`. Do not add a public export just for internal reuse.

```text
Radios/
  subcomponents/
    RadioControl.tsx
    radioControlVariants.ts
RadioBoxes/
  RadioBox.tsx                    # Imports Radios/subcomponents/RadioControl
partials/
  FieldLayout/
  FieldLabel/
  FieldValidationError/
```

For substantial field renderers, default to a small binding component and a
`<Component>Control` subcomponent that owns presentation, DOM refs, interactions
and composition. Simple fields can keep presentation inline when it remains easy
to read. Do not add a control subcomponent that only forwards props. Aim for clear
ownership and a small top-level component, rather than a fixed number of layers.

Input is the concrete example: `Input` connects the form hooks, `InputControl`
owns presentation and focus, and the additional subcomponents below isolate the
field engine, bordered input surface and individual controls. Name subcomponents
for the element or responsibility they own, and give distinct controls their own
files, such as `InputClearButton.tsx` and `InputStepper.tsx`. Avoid broad names
such as `InputContent` or `InputActions` when a more concrete name fits.

```text
Input/
  README.md                       # Purpose, usage and useful behavior notes
  Input.tsx                       # InputProps and form binding
  inputVariants.ts                # Recipes and styling-derived types
  Input.stories.tsx               # Setup, normal stories, composition, edge cases
  Input.test.tsx                  # Snapshot and behavior describe blocks
  index.ts                        # Existing intentional public entry point
  subcomponents/
    InputControl.tsx              # Props, presentation, DOM refs, interactions and layout
    InputControl.test.tsx         # Tests for this separate component
    InputField.tsx                # TextField / NumberField context
    InputWrapper.tsx              # Bordered Group, editable input and surrounding controls
    InputClearButton.tsx          # Clear action
    InputStepper.tsx              # Number increment and decrement controls
```

Shared pure functions belong in `helpers/<helper>/<helper>.ts`, with colocated
tests. Keep `partials/` for React presentation shared across field families and
its supporting contracts.
For example:

```text
src/
  helpers/
    getFieldDataAttributes/
      getFieldDataAttributes.ts
      getFieldDataAttributes.test.tsx  # DOM contract and state combinations
  partials/
    FieldLayout/
    types.ts
```

Import private helpers directly, adding them to a public helpers barrel is an
intentional API decision rather than part of moving the file.

Extract a component when it isolates a responsibility, not simply to shorten a
file. Give distinct controls their own files, as `InputClearButton` and
`InputStepper` do. Do not add public exports or barrel files for private pieces.

For forms, keep registration, transforms, validation timing and debouncing in
the binding layer. Presentation receives values, refs and callbacks without
reading form context. [Input.tsx](../packages/uniform/src/Input/Input.tsx) and
[InputControl.tsx](../packages/uniform/src/Input/subcomponents/InputControl.tsx)
show that boundary. Keep DOM refs, ref merging and focus behavior in presentation.
For example, `useInputValueDebounce` cancels pending edits and resets the form
value. `Input` passes its `clear` operation as `onReset`, while `InputControl`
invokes it, notifies the consumer through `onClear` and restores input focus. Pass a
value callback directly when it already accepts the expected value, rather than
adding a handler just to construct an event.

Keep shared accessibility fallback rules in the field binding hook. Components
pass their label, accessible-name override and placeholder without resolving a
second naming policy locally:

```tsx
const field = useUniformField({
  ...uniformProps,
  name,
  placeholder,
});
```

An explicit accessible name wins, followed by the visible label, a nonblank
placeholder and finally the field name. Rich labels keep their ID association.

Name binding hooks for their responsibility, such as `useUniformField` and
`useUniformFieldArray`. A `State` suffix adds little here. Keep private hooks
private through the package exports rather than encoding that distinction in
their names.

Keep public API, DOM semantics, slots, focus and values unchanged during a
structural refactor.

Reuse Uniform's [shared field partials](../packages/uniform/src/partials/README.md)
for labels, descriptions and error wrappers. Keep their props local to each
component, and let the owning field choose native or React Aria label semantics:

```tsx
<FieldLabel as={Label} id={ids.label} required={required}>
  {label}
</FieldLabel>
```

Shared presentation receives state and IDs from the field, without registering
another field or imposing a wrapper on every layout.

Use [FieldLayout](../packages/uniform/src/partials/FieldLayout/README.md) for the
default label → control → supporting messages arrangement. It renders a fragment inside the
field engine, which keeps the root element, `base` slot and React Aria context:

```tsx
<InputField {...fieldProps}>
  <FieldLayout {...layoutProps}>
    <InputWrapper {...contentProps} />
  </FieldLayout>
</InputField>
```

A shared field engine should receive explicit values, state, associations and
callbacks, rather than the whole binding hook result. Keep layout composition
outside the engine. For example, Radios and RadioBoxes share:

```tsx
<RadioGroupField {...groupProps}>
  <FieldLayout {...layoutProps} labelAs={Label}>
    {options}
  </FieldLayout>
</RadioGroupField>
```

Here `Label` is React Aria's group label, so the layout does not add a native
`htmlFor` association to a group. `RadioGroupField` owns selection, disabled state,
focus routing and shared description context. `RadioControl` owns each option's
presentation. Their group and option recipes live in separate variants files.

The binding creates IDs once, and the layout consumes them. Pass resolved slot
classes from the owning recipe. Compose individual partials directly when a
field needs another arrangement or label semantics. Input uses this default
alongside TextArea, Select, Radios and RadioBoxes. The layout composes `FieldDescription` and the
supplied `errorMessage` inside its helper wrapper. Avoid another component whose
only job is grouping the supporting messages.

`useUniformField` returns a rendered `errorMessage` using `FieldValidationError`,
which owns the message list and animation. Field presentation owns placement,
visibility and the styled association wrapper. Keep this wrapper as native markup
rather than adding another shared error component:

```tsx
{
  invalid ? (
    <div
      className={classNames.errorMessage}
      data-slot="error-message"
      id={ids.error}
    >
      {errorMessage}
    </div>
  ) : null;
}
```

Keep field data attributes small and meaningful. Use the private
`getFieldDataAttributes` helper for shared disabled, invalid and required styling
state, omitting inactive flags. Keep accessible associations, React Aria props
and callbacks separate. Interaction state belongs to the control, while
field-specific state such as checked or expanded belongs to its renderer:

```tsx
<div
  {...getFieldDataAttributes({ disabled, invalid, required })}
  data-focus={focused || undefined}
  data-slot="base"
>
  {children}
</div>
```

`data-filled` means the field has a value, including numeric zero, regardless of
its placeholder. Avoid duplicate state flags and static content markers such as
`data-has-helper`. Add a content-presence flag only when a real styling need
exists, and derive it where that content is rendered. Input, TextArea and Select
are the first consumers of this shared mapping, rather than prescribing every
field's attributes through one large object.

Reuse interaction state already exposed by React Aria components instead of
copying it into React state just for styling. For example, Input's Group owns
hover state on the input wrapper, so its recipe uses `data-[hovered=true]` without
an `onHoverChange` callback or hover state in InputControl:

```tsx
<Group className={classNames.inputWrapper} isDisabled={disabled}>
  {children}
</Group>
```

```ts
const inputVariants = tv({
  slots: {
    /** Bordered container around the editable area */
    inputWrapper: 'border-default-200 data-[hovered=true]:border-default-400',
  },
});
```

## Types live with their owner

Component props belong beside their implementation. Recipe-derived types belong
with their recipe, including `VariantProps`, `ClassName` and resolved slot types.
See [styling type derivation](./styling.md#2-derive-the-public-prop-types-from-the-variants).

Small component-local recipes can stay in the component file, with their derived
types beside them. Do not create a separate variants file just for a few simple
slots. Keep substantial or shared recipes in dedicated files, as Input does.
When related components share a recipe, keep it in one component’s variants file
and import it directly from the other. For example, DatePicker extends
`timeVariants` from `Time/timeVariants.ts`. Do not create a separate shared styling
folder just for this reuse. Reserve `partials/` for shared presentation components.
See the
[shared recipe example](./styling.md#recipe-file-ownership).

```tsx
// FieldValidationError.tsx
const fieldValidationErrorVariants = tv({
  slots: {
    /** List of validation messages */
    base: '',
    /** Padded content inside an animated entry */
    message: 'px-1 pt-1',
  },
});

type ClassName = TVClassName<typeof fieldValidationErrorVariants>;

export interface FieldValidationErrorProps {
  /** CSS class name */
  className?: ClassName;
  // ...
}
```

Use `className` for styling props on subcomponents too, including resolved slot
maps. Keep the types accurate: consumer overrides and resolved class strings
are different contracts. Name resolved slot maps `classNames` locally.
Give every slot definition a short description of its role or contents, such as
`/** Container grouping increment and decrement buttons */`, without a trailing
full stop. Avoid simply restating the component and slot names, such as
`/** Alert description */`, when `/** Supporting message below the title */`
explains more. See the
[slot definition example](./styling.md#1-define-slots-and-variants-with-tv).

Include consumer-stylable labels, hints, errors and actions in the public recipe,
so their slots are available in the prop type. See
[Input's slot reference](../packages/uniform/src/Input/README.md#styling) for an example.

Keep variant resolution and class merging together in a separate block, headed
by `// classNames from slots`. Use `variants` for the intermediate result instead
of nesting resolution inside the merge call:

Use Tailwind Variants for slot class composition. Do not create standalone maps
such as `hintClassNames = { description: '...', errorMessage: '...' }` or inject
slot defaults inline when passing them to a partial. Define those slots in the
owning recipe and pass the resolved map, for example
`<FieldLayout className={classNames} /* ... */ />`. See the
[recipe example](./styling.md#3-resolve-slot-classes-and-merge-the-callers-classname).

```tsx
const InputControl = ({ className, ...props }: InputControlProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(inputStateVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return <InputWrapper {...props} className={classNames} />;
};
```

```ts
// inputVariants.ts
export type VariantProps = TVProps<typeof inputVariants>;
export type ClassName = TVClassName<typeof inputVariants>;
```

```tsx
// Input.tsx
import type { ClassName, VariantProps } from './inputVariants';

export interface InputProps extends VariantProps {
  /** CSS class name */
  className?: ClassName;
  /** Field name */
  name: string;
}
```

Name and reuse shared contracts instead of repeating large `Pick` expressions.
Shared contracts belong in their shared area, not a catch-all types file.
For contracts shared across Uniform partials, use `partials/types.ts`.
Component-specific props still stay in their component file.

```tsx
// partials/types.ts
/** Attributes associating a native control with its label and validation */
export type FieldControlProps = Pick<
  HTMLAttributes<HTMLElement>,
  | 'id'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-invalid'
  | 'aria-required'
>;

// Used by both field-state helpers and presentation prop definitions.
controlProps: FieldControlProps;
```

Reuse existing types with `Pick` or indexed access. Document how an `unknown`
value is handled instead of hiding the uncertainty with a cast.

## Document props and components

Document every declared prop, including private callbacks, refs and option types.
Prefer simple labels such as `Field label`, `Placeholder text` and `Input size`.
Do not add `Sets`, `Provides` or `Displays` just to turn a clear label into a sentence.
Use an effect description when it helps, such as `Disables the input`.

Identify callbacks and their triggers. Add detail for non-obvious behavior, units
or defaults. Keep descriptions as short phrases without trailing full stops,
including `/** CSS class name */` and `/** Field name */`. Inherited props retain
their original documentation. Styling details belong in [styling.md](./styling.md).

```tsx
export interface InputProps extends VariantProps {
  /** CSS class name */
  className?: ClassName;
  /** Field name */
  name: string;
  /** Field label */
  label?: ReactNode;
  /** Placeholder text */
  placeholder?: string;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Disables the input */
  disabled?: boolean;
  /** Delay in milliseconds before updating form state (default: 300) */
  debounceDelay?: number;
  /** Callback when the input value is cleared */
  onClear?: () => void;
}
```

Keep the scope accurate for subcomponents too:

```tsx
/** Disables the clear button when the input is disabled */
disabled?: boolean;
/** Callback when the clear button is activated */
onClear: () => void;
```

A main component's docstring describes its purpose. For form fields, name the
kind of field and what it accepts or selects, using familiar terms such as
"text" rather than implementation types such as "strings".

Add context or constraints only when they are not obvious and affect correct
usage. For example, Uniform
fields do not need to repeat that they require a Uniform Form. Show that setup in
the README example instead. A one-line header is enough when there is nothing
else to explain.
Keep optional features and defaults in prop docs or the README. Examples and
upstream documentation links belong in the README. Avoid internal wiring
descriptions and feature lists.

```tsx
/** Form input field for text, passwords or numbers */
const Input = ({ name, ...props }: InputProps) => {
  // ...
};
```

Subcomponent headers describe their local responsibility and required context.
Private React Aria wrappers keep links to the components or hooks whose context
they depend on, as below. The public component's React Aria references belong in
its README. Keep both kinds of header focused on useful information.

```tsx
/**
 * Editable input layout built from React Aria Group and Input.
 *
 * Receives TextField or NumberField context from InputField.
 *
 * @see https://react-aria.adobe.com/Group
 * @see https://react-aria.adobe.com/TextField
 * @see https://react-aria.adobe.com/NumberField
 */
const InputWrapper = (props: InputWrapperProps) => {
  // ...
};
```

Verify the links. Native helpers, such as a decorative Chevron, need a short
purpose description without an unrelated React Aria link.

## Keep binding logic out of JSX callbacks

Name handlers for ref wiring, value adaptation and multi-step actions above
the JSX. Prefix event handlers with `handle`, such as `handleFocus`,
`handleValueChange` and `handleClear`. Give each a short purpose comment above its
definition, in lowercase without a trailing full stop. This does not require a
comment above every setup block or local variable.

Do not extract every trivial expression. Use `useCallback` only when callback
identity matters, not just because a handler has a name.

Apply the same pattern inside subcomponents. Keep event logic in the handler,
with only handler selection in JSX, as in [InputWrapper](../packages/uniform/src/Input/subcomponents/InputWrapper.tsx):

```tsx
<AriaInput
  onChange={type === 'number' ? handleChange : undefined}
  onKeyDown={handleKeyDown}
/>
```

```tsx
// inside InputControl, retain an object ref while forwarding the supplied ref
const { inputRef } = props;
const controlRef = useObjectRef(inputRef);

// focus the editable input
const handleFocus = () => {
  controlRef.current?.focus();
};

// clear the value, notify the consumer and restore input focus
const handleClear = () => {
  onReset();
  onClear?.();
  handleFocus();
};

return (
  <InputWrapper
    inputRef={controlRef}
    onClear={handleClear}
    onFocusControl={handleFocus}
  />
);
```

## Keep tests together and separate cases with whitespace

Use one test file per component or hook, with separate `describe` blocks for
snapshots and behavior. A distinct subcomponent can have its own tests.

New shared partials have their own stories and tests too. For example,
`FieldLayout.stories.tsx` shows labels, controls and supporting messages, while
`FieldLayout.test.tsx` snapshots those stories and tests validation visibility
changes. Keep these files beside the partial rather than relying only on its
consumers' coverage.

Always leave a blank line between cases and describe blocks. Separate setup,
interactions and assertions when it helps show the test's phases.

```tsx
describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Number display values', () => {
  it('keeps a cleared value empty', () => {
    expect(toDisplayValue(null)).toBe('');
    expect(toDisplayValue(undefined)).toBe('');
  });

  it('preserves numeric zero', () => {
    expect(toDisplayValue(0)).toBe(0);
    expect(toDisplayValue('0')).toBe(0);
  });
});
```

Test behavior rather than implementation details. For native ref identity, use
`expect(ref.current).toBe(input)` instead of a deep matcher over the DOM tree.

## One story file, ordered sections

Group hook stories under `<package>/hooks/<hookName>`, including private hooks.
The sidebar describes the code's role, not its export visibility.

```tsx
title: 'uniform/hooks/useUniformField',
```

Keep stories in `<Component>.stories.tsx`, ordered with dashed section banners.
Put metadata, decorators and shared fixtures in setup. Default comes first among
normal stories; composition and edge cases follow.

```tsx
// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------
```

Use sections instead of separate `InputComposition.stories.tsx` or
`InputEdgeCases.stories.tsx` files. One standard CSF file has one sidebar title;
use names such as `Edge Cases: Nullish Number` for edge-case stories.

Preserve `play` assertions, scenario descriptions and decorator order when moving
stories. See [the story workflow](./agent-workflows.md#storybook-stories-and-edge-cases)
for the shared explanation decorator and verification.

## Component READMEs

Keep a small `README.md` beside each public component, starting with Uniform.
Private subcomponents are covered by their owner's README unless they need
independent documentation. Sort component indexes alphabetically by component name,
as in [Uniform’s component index](../packages/uniform/README.md#components).

Keep package READMEs as concise entry points: purpose, a typical example, a
component index and links to further docs. Put package architecture and migration
notes in `docs/<package>/`, for example
[Uniform field composition](./uniform/field-composition.md) and
[Uniform migration notes](./uniform/migration.md). Link to shared code-style and
styling guides instead of copying their rules into the package README.

Include a one-line purpose, one typical example using the public import, and a
few notes only where a consumer needs them. Link to props and stories instead of
copying the prop interface. Put relevant upstream documentation links here,
rather than in the main component's docstring. Include required providers or parent components in
the example. Keep styling details in [styling.md](./styling.md).

For example, [Input's README](../packages/uniform/src/Input/README.md) follows:

````md
# Input

Text, password and number input connected to a Uniform form.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Input from '@fuf-stack/uniform/Input';

<Form onSubmit={console.log}>
  <Input label="Email" name="email" />
</Form>;
```

## Notes

- Edits update the display immediately, form updates are debounced by default

[Props](./Input.tsx) · [Stories](./Input.stories.tsx)
````

Add sections as useful information appears, such as a tricky composition or value
format. Do not add empty placeholders, exhaustive prop tables or implementation
inventories to satisfy a template. Update the README when its usage or behavior
changes, and keep examples consistent with the component.

## Maintain this guide with feedback

Update the relevant rule **and its concrete example** when the maintainer gives
further agreed feedback. Keep entries short enough to skim; explain the useful
choice without listing every possible exception.

For example, feedback that a registration comment is redundant should remove
that comment from the example and retain the blank line. A debounce comment can
stay because it explains when updates happen.

Reconcile corresponding examples in [styling.md](./styling.md) and
[agent-workflows.md](./agent-workflows.md). Older code is a reference, not proof
that every existing pattern is preferred. Follow the user's current review and
commit instructions.
