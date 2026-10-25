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

## Component and slot markers

Public UI components identify their outer DOM element with `data-component`,
using the component name in lowercase kebab-case. Slots retain `data-slot`.
Subcomponents do not add component markers unless independently public.
When a component exposes a marker override, use a normal camelCase React prop,
for example `<Button dataComponent="submit-button" />`, and map it to
`data-component` on the DOM element. Follow the same `dataSlot`/`data-slot`
pattern for slot overrides. Native DOM props in `baseProps` retain their HTML names.

```tsx
<div data-component="avatar-group" data-slot="base">
  <span data-slot="count">+2</span>
</div>
```

Put markers on existing elements, without adding wrappers. Shared renderers
preserve the public owner's identity, for example `drawer` instead of `modal`
and `submit-button` instead of `button`. Portaled overlays mark their outer
surface wrapper. Fragment-based compositions mark their primary surface,
providers and hosts without their own DOM root do not introduce one.

See [styling](./styling.md#component-and-slot-markers) for selector examples.

## Readability before compactness

Use blank lines to separate setup, state, handlers and rendering. Keep related
statements together, and leave a blank line before the return. Group by intention,
not just statement kind: accessible associations, normalized values, step markers
and fill geometry are separate blocks even though all are derived values. Keep
hooks together at the top and styling resolution in its own block. Do not place
an unrelated hook between styling and derived values. Apply this inside
subcomponents, effects and render callbacks too, rather than only in the main
component body.

Separate top-level declarations with blank lines too, including a recipe, each
exported type and the final default export. Keep a declaration’s docstring attached
to it. See the [variant export example](#types-live-with-their-owner).
Always leave a blank line between a props interface and the component docstring:

```tsx
interface FieldArrayProps {
  /** Field name */
  name: string;
}

/** Form field group for adding, removing and reordering array entries */
const FieldArray = ({ name }: FieldArrayProps) => {
  // ...
};
```

Comments are optional. Add a short one for timing, a constraint or a surprising
choice. Skip comments that repeat the function name or narrate obvious code.
Whitespace is often enough. Write explanatory `//` comments in lowercase, without
a trailing full stop. Use a comma rather than a semicolon between related phrases.
Section banners and proper names keep their normal capitalization.

In composed JSX, add short section comments where they help readers locate the
main parts of the layout. Separate sections with blank lines. Name the purpose
of a section, not every wrapper or child. Put shared label/content/message markers
in `FieldLayout`, rather than repeating them in every control that uses it.
Simple compositions do not need section comments.

```tsx
<Card>
  {/* card header with label */}
  <FieldLabel>{label}</FieldLabel>

  {/* card content */}
  <div className={classNames.content}>{children}</div>

  {/* card footer with validation messages */}
  <FieldCardValidationError error={error} />
</Card>
```

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
    field={{ ...field, onBlur, onChange, value }}
  />
);
```

Separate value normalization from the binding hook with a blank line. Explain a
fallback or interpretation, rather than restating the expression:

```tsx
const { field } = useUniformField(options);

// treat non-array form values as an empty selection
const value = Array.isArray(field.value) ? (field.value as string[]) : [];
```

For example, keep the slider value, step markers and fill geometry separate.
Related calculations stay together without a comment on every block:

```tsx
const rawValue = displayValue != null ? Number(displayValue) : minValue;
const value = Math.min(maxValue, Math.max(minValue, rawValue));

const stepCount = showSteps
  ? Math.max(0, Math.floor((maxValue - minValue) / (step > 0 ? step : 1)) + 1)
  : 0;

const offset = fillOffset ?? minValue;
const offsetPercent =
  maxValue === minValue
    ? 0
    : (Math.min(maxValue, Math.max(minValue, offset)) - minValue) /
      (maxValue - minValue);
```

Keep a related object such as `field` intact when nested destructuring and aliases
make the data flow harder to follow. `field.value` and `field.onChange` explain
where the values come from without requiring the reader to remember aliases.

Put forwarded props first, followed by explicit overrides in alphabetical order.
Apply this to prop objects too, including `baseProps`, shared root props and hook
options. Keep spread order stable, and preserve intentional overrides when
reordering because the last value wins.

```tsx
baseProps={{
  ...getFieldDataAttributes(field),
  'data-component': 'select',
  'data-testid': `${testId}_wrapper`,
}}
```

```tsx
const { field } = useUniformField({
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

  const { className, field } = props;

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

Sort declared props and `Pick` keys alphabetically. Keep documented properties
adjacent, without blank lines between them. Separate the whole interface from the
component docstring with one blank line.

```tsx
interface DatePickerControlProps {
  /** Reset bridge rendered inside the date engine */
  children: ReactNode;
  /** Bound field values, interactions and metadata */
  field: UniformField<unknown, DatePickerValue>;
}
```

Private components belong in a `subcomponents/` folder under their owner. Give
each an identifiable job, especially around React Aria composition. The main
component should read as an orchestration of those jobs, rather than containing
every field engine, addon, icon and action inline.

Component-local hooks belong in the owning component's `hooks/` folder, with
focused tests beside them. Keep hooks shared across field families in `src/hooks/`.
Test the hook's decisions and timing, while component tests cover the rendered result.

```text
FieldCard/
  FieldCard.tsx
  hooks/
    useFieldCardValidation.ts
    useFieldCardValidation.test.ts
```

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
  subcomponents/
    RadioBox.tsx                  # Imports Radios/subcomponents/RadioControl
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
  stories/                        # Story setup and sidebar groups
    Input.stories.tsx             # Normal usage and composition
    Input.interactions.stories.tsx # Interaction scenarios with play assertions
    Input.edge-cases.stories.tsx  # Boundary and failure scenarios
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

Shared pure functions belong in `helpers/<responsibility>/<responsibility>.ts`,
with colocated tests. Related functions can share one module with named exports. Keep `partials/` for React presentation shared across field families and
its supporting contracts.
For example:

```text
src/
  helpers/
    fieldProps/
      fieldProps.ts              # Control associations and styling attributes
      fieldProps.test.tsx        # DOM contracts and state combinations
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

Keep UI value adapters in the control that owns the engine. For example, a
radio control converts React Aria string keys back to the option's original type,
so the binding passes `field` directly. Interaction handlers belong in the control that owns the interaction. If they
need current form state, pass a narrow read-only accessor from the binding rather
than moving form context into the control. For example, Select receives
`getIsTouched` and Slider receives `getCurrentValue`.

Do not introduce a component-local hook solely to hide a small handler. Extract
hooks when they own substantial reusable or stateful logic.

```tsx
const { field, getValues } = useUniformField({ ...uniformFieldProps, name });
const getCurrentValue = (): unknown => getValues(name);

return <SliderControl field={field} getCurrentValue={getCurrentValue} />;
```

Substantial form coordination belongs in its owning hook: `useUniformFieldArray`
binds row operations, and FieldCard's local validation hook resolves child state.
Display preparation belongs in controls; storage conversion uses the existing
field transform mechanism, configured by the binding. Resolve configuration such
as value transforms in a separate named variable before passing it to a hook.
Avoid nesting configuration factories inside hook options, keep the two steps
in separate blocks.

```tsx
const transform = createDatePickerValueTransform({
  timeZone,
  valueType,
  withTime,
});

const { field } = useUniformField({
  ...uniformFieldProps,
  name,
  transform,
});

return (
  <DatePickerControl field={field} timeZone={timeZone} withTime={withTime} />
);
```

```tsx
// RadioBoxes.tsx
<RadioBoxesControl field={field} options={options} />;

// RadioBoxesControl.tsx
const { convertToOriginalType } = createOptionValueConverter(options);

// restore the selected option's original value type
const handleChange = (nextValue: string) => {
  field.onChange(convertToOriginalType(nextValue));
};
```

Keep bound field data together as `field`, using the same name in the hook and
control props. Define the hook's field object before its return, with a short
comment and explicit properties. Do not spread the underlying controller into
this contract. Keep form operations (`control`, `getValues`, `resetField`) and
provider configuration (`debugMode`) outside it.

```tsx
// collect the bound field without exposing controller internals
const field = {
  // other explicitly declared field properties
  customAriaLabel,
  name: controllerField.name,
  onBlur,
  onChange: transformedOnChange,
  ref,
  value: transformedValue,
};

return { control, debugMode, field, getValues, resetField };
```

Derive element attributes where they are applied. Keep related helpers in
`helpers/fieldProps/fieldProps.ts`, using named exports and colocated tests.
`getFieldControlProps(field)` creates ID and ARIA associations, while
`getFieldDataAttributes(field)` creates styling flags. Their targets may differ.
The binding hook returns metadata, not precomputed DOM props.

```tsx
const controlProps = getFieldControlProps(field);
const dataAttributes = getFieldDataAttributes(field);
```

Pass `field` to a control, never spread the whole bundle onto a DOM element.
Bindings may override their own bundle for debouncing or value conversion.
See [Uniform field composition](./uniform/field-composition.md#bound-field-contract)
and the [helpers guide](../packages/uniform/src/helpers/README.md).

Keep shared accessibility fallback rules in the field binding hook. Components
pass their label, accessible-name override and placeholder without resolving a
second naming policy locally:

```tsx
const { field } = useUniformField({
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
default label → control → supporting messages arrangement. By default it owns the
outer `div` and applies `className.base`. Pass root attributes, interactions and
refs through `baseProps`, never a second `className` or replacement children:

```tsx
<FieldLayout
  {...layoutProps}
  baseProps={{ ...focusWithinProps, ref: handleControlRef, role: 'group' }}
  className={classNames}
>
  <RadioTabsList {...tabProps} />
</FieldLayout>
```

Use `baseAs` to choose a field engine for the base slot and `baseProps` to
configure it. Infer the configuration from the selected component, including its
callbacks and ref. Require `baseProps` when that component has required props,
keep it optional for the default `div`. Keep `FieldLayout` outermost in the composition, and add a short
comment explaining a custom base’s role. The engine still wraps the label,
control and messages in the rendered tree:

```tsx
<FieldLayout
  {...layoutProps}
  // provide the text or number field engine
  baseAs={InputField}
  baseProps={fieldProps}
  className={classNames}
>
  <InputWrapper {...contentProps} />
</FieldLayout>
```

A shared field engine should receive explicit values, state, associations and
callbacks, rather than the whole binding hook result. Keep layout composition
outside the engine. For example, Radios and RadioBoxes share:

```tsx
<FieldLayout
  {...layoutProps}
  baseAs={RadioGroupField}
  baseProps={groupProps}
  labelAs={Label}
>
  {options}
</FieldLayout>
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
  {...getFieldDataAttributes(field)}
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

Group long slot class lists into commented arrays by purpose, preserving class
order and keeping short styles simple. See the
[class grouping example](./styling.md#group-long-class-lists-by-purpose).

Keep slot keys alphabetical, including slot overrides within variants. Use one
recipe for a field's defaults and state variants. Split recipes only for distinct
rendered controls or actual shared defaults, such as segmented input styling used
by both Time and DatePicker. `VariantProps` describes every recipe variant without
filtering. Extend it only when the component intentionally exposes those variants.
Otherwise define component props explicitly, keeping derived state private:

```ts
export const textAreaVariants = tv({
  slots: {
    /** Supporting text below the textarea */
    description: 'text-tiny text-foreground-500',
    /** Validation message container */
    errorMessage: 'text-tiny text-danger',
    /** Editable multiline text */
    input: 'w-full bg-transparent',
  },
  variants: {
    invalid: { true: { input: 'text-danger' } },
  },
});

export type VariantProps = TVProps<typeof textAreaVariants>;
```

```tsx
// TextArea.tsx
export interface TextAreaProps {
  /** Disables the field */
  disabled?: boolean;
  /** Field name */
  name: string;
}
```

## Types live with their owner

Component props belong beside their implementation. Recipe-derived types belong
with their recipe, including `VariantProps`, `ClassName` and resolved slot types.
Export the main recipe through the component index and describe the elements or
states it styles, as shown in [recipe file ownership](./styling.md#recipe-file-ownership).
See [styling type derivation](./styling.md#2-derive-the-public-prop-types-from-the-variants).

Small component-local recipes can stay in the component file, with their derived
types beside them. Do not create a separate variants file just for a few simple
slots. Keep substantial or shared recipes in dedicated files, as Input does.
When related components share a recipe, keep it in one component’s variants file
and import it directly from the other. For example, DatePicker extends
`segmentedInputVariants` from `Time/timeVariants.ts`. Do not create a separate shared styling
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
  const variants = styling.resolve(inputVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return <InputWrapper {...props} className={classNames} />;
};
```

```ts
// inputVariants.ts
export type VariantProps = TVProps<typeof inputVariants>;

export type ClassName = TVClassName<typeof inputVariants>;

export default inputVariants;
```

```tsx
// Input.tsx
import type { ClassName } from './inputVariants';

export interface InputProps {
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
export interface InputProps {
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

Let the header's length follow the useful information, rather than enforcing a
one-line format. Complex components can have longer headers when an overview of
their capabilities, behavior or usage helps readers understand them. Keep the
opening description clear, then group additional context into short paragraphs
or a list when useful. A simple component may need only one line.

Preserve valuable context when editing or extracting components. Explain important
behavior such as when edits are committed or how incremental loading works,
without listing every prop or internal hook. Keep detailed configuration,
examples and upstream links in the README or prop docs. Skip obvious setup,
such as repeating that a Uniform field requires a Uniform Form.

```tsx
/** Form input field for text, passwords or numbers */
const Input = ({ name, ...props }: InputProps) => {
  // ...
};
```

When extracting subcomponents, keep the top-level purpose header and preserve
useful rationale beside the code that now owns it. Move architecture details to
the component README rather than replacing the public description with internal
wiring or deleting comments that explain a constraint.

```tsx
/**
 * Configurable data table built on TanStack Table with semantic table markup
 *
 * Configure search, sorting, column visibility, row selection and pagination
 * through column definitions and `features`, with optional custom toolbar content
 *
 * Supports virtual scrolling and cursor-based loading for larger datasets
 * Customize individual slots through `className`
 */
const DataTable = <TData, TValue>(props: DataTableProps<TData, TValue>) => {
  // ...
};

// inside the table surface
// keep the header outside the viewport so only the body scrolls
```

For hooks with non-obvious policy, explain what they derive, why the owning
component needs that logic, and the important visibility or timing rules. Keep
this rationale in the header rather than narrating each statement below.

```tsx
/**
 * Derives the card's required and invalid states from its nested fields
 *
 * A card groups independently registered inputs, so its own field state does
 * not tell us whether a child is required or which child errors are visible
 *
 * Child errors become visible after that child is touched or the form is submitted
 * Debounces invalid-state changes to prevent flickering during validation updates
 */
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

## Story folders and sidebar groups

Put all stories in a `stories/` folder under their owning component, hook or
example directory. Keep the component's tests beside the implementation, and
import every story group into its snapshot test so moving a story preserves its
coverage. Shared story-only metadata, decorators and fixtures belong in
`<Component>.storySetup.tsx` inside that folder when multiple groups need them.

Use separate CSF files for real sidebar groups. Standard Storybook gives each
file one title, section comments and slashes in story names do not create folders.
Keep normal usage and composition together, and add other files only when there
are scenarios to put in them:

```text
Tooltip/
  Tooltip.tsx
  Tooltip.test.tsx
  stories/
    Tooltip.storySetup.tsx
    Tooltip.stories.tsx               # pixels/Tooltip
    Tooltip.interactions.stories.tsx  # pixels/Tooltip/Interactions
    Tooltip.edge-cases.stories.tsx    # pixels/Tooltip/Edge Cases, when needed
```

Each story file declares its title as a literal so Storybook can index it:

```tsx
import { meta as sharedMeta } from './Tooltip.storySetup';

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Tooltip/Interactions',
};

export default meta;
```

Keep setup first, followed by stories, with short dashed section banners where
useful. Default comes first among normal stories. Interaction stories must execute
the interaction and assert its result, a static example named `KeyboardFocus`
is not a keyboard test. Normal and edge-case stories can also have `play`
assertions, classify scenarios by their purpose rather than just the presence of
`play`.

```tsx
export const KeyboardFocus: Story = {
  args: {
    children: <button type="button">More information</button>,
    content: 'Keyboard-accessible details',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'More information' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    const tooltip = await canvas.findByRole('tooltip');
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  },
};
```

Group hook stories under `<package>/hooks/<hookName>`, including private hooks.
The sidebar describes the code's role, not its export visibility:

```tsx
title: 'uniform/hooks/useUniformField',
```

Preserve `play` assertions, scenario descriptions and decorator order when moving
stories. See [the story workflow](./agent-workflows.md#storybook-stories-and-edge-cases)
for the shared explanation decorator and verification.

## Package READMEs

Keep the package-root README to a short introduction describing the package and
what it provides. Do not turn it into an index of component guides or repository
style documentation. Those files are not necessarily shipped with the package.

```md
# Megapixels

Advanced React components for data-heavy interfaces, built on Pixels and Uniform.
Includes data tables, configurable filters, virtualized lists and notifications.
```

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

[Props](./Input.tsx) · [Stories](./stories/Input.stories.tsx)
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
