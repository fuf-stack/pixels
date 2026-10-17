# Pixels migration

## Button and ButtonGroup

Button uses React Aria Button for press, focus and disabled behavior. ButtonGroup
owns the group element and context. Both use owned Tailwind Variants recipes
resolved through the consumer's styling instance.

Public imports, the native button ref, press callback, form association, loading
state and opt-in ripple remain supported. The button recipe still returns a
single class string, so existing recipe extensions remain valid. The recipes no
longer extend HeroUI or refer to its CSS variables. Small spinner and ripple
components stay under Button, the ripple hook owns overlapping animation state.

### Compatibility

Pixels previously applied its own button recipe on top of HeroUI's group-aware
recipe. The migration preserves that order: group width and edge styling remain,
while Pixels child defaults continue to override group color, size, variant and
disabled defaults. A group variant can still contribute classes that the child
variant does not replace, such as the border from `variant="bordered"`.
Button’s explicit `ripple` setting also retains precedence over group
`disableRipple`.

This is existing behavior, not a new group-default contract. Configure each
Button explicitly when those properties matter. Normalizing this precedence
should be a separate API decision with consumer review.

React Aria adds its own DOM IDs and state attributes. Existing `data-hover`,
`data-focus`, `data-focus-visible`, `data-pressed`, `data-disabled` and
`data-loading` styling hooks remain available. Ripple feedback and the loading
spinner respect reduced motion.

### Migration status

All Pixels component renderers now use owned code and styling. Shared HeroUI dependencies, plugin exports and source scanning are removed.
Workspace consumers and published packages are verified with owned tokens. No Pixels component imports HeroUI runtime components or
types.

[Button](../../packages/pixels/src/Button/README.md) · [ButtonGroup](../../packages/pixels/src/ButtonGroup/README.md) · [Styling](../styling.md) · [Migration inventory](../heroui-removal.md)

## Popover

Popover uses React Aria DialogTrigger and Dialog, with the overlay and positioning
hooks for non-modal dismissal. A small overlay component owns positioning,
portalling, animation and focus restoration. The trigger and section layout live
in their own subcomponents, all slot defaults live in `popoverVariants.ts`.

Using the hooks preserves outside-press dismissal, independent scroll blocking
and the existing `Element` portal contract without a deprecated portal prop.
Overlay isolates the trigger's press context from buttons inside the dialog.
Header content now labels the dialog, with the trigger as the fallback name.
Entry and exit use the existing scale/fade timing and respect reduced motion.

The existing placement names, controlled-state object, trigger button props and
styling slots remain supported. The `base` and `overlay` slots additionally expose
the arrow surface and animated wrapper. Styled triggers preserve their previous
success and warning foregrounds while reusing Pixels Button.

Pixels no longer declares `@heroui/popover` directly. Other HeroUI components may
still bring it in transitively. Popover's scrollable body uses the owned ScrollShadow component.
Menu now uses Pixels Button, so its former HeroUI button dependency is removed.

[Popover usage and slots](../../packages/pixels/src/Popover/README.md)

## ScrollShadow

ScrollShadow uses a native scroll container and owned mask styles. Its local hook
updates the existing edge attributes on scroll, content changes and resize, without
adding a wrapper around children. Horizontal RTL scrolling uses physical left and
right edges. Explicit visibility modes remain independent of overflow.

The native ref, inline styles, shadow size and visibility API remain supported.
Pixels no longer declares `@heroui/scroll-shadow` directly, though other HeroUI
components can still depend on it transitively.

[ScrollShadow usage](../../packages/pixels/src/ScrollShadow/README.md)

## Progress

Progress uses React Aria's progress-bar semantics and owned track, label and
indicator recipes. The activity indicator owns its repeating motion, while normal
value updates retain the half-second transition and skip the initial animation.
Reduced motion and `disableAnimation` show a static activity segment.

The percentage, completion color, formatter and public styling slots remain
supported. Rich formatter content renders visually while ARIA receives the numeric
percentage, rather than serializing a React element into an attribute.
Pixels no longer declares `@heroui/progress`, both progress components now own their rendering.

[Progress usage](../../packages/pixels/src/Progress/README.md)

## ProgressCircular

ProgressCircular uses the same React Aria range semantics as Progress. Its ring
subcomponent owns SVG geometry and size-dependent stroke widths, with the existing
five sizes, rounded caps and track appearance. The main component chooses normal,
completed or error content, and the owned recipe exposes a `statusIcon` slot in
addition to the existing slots.

Errors take precedence over completion. Rich values and status icons no longer
become serialized objects in ARIA attributes, errors announce "Error" and normal
progress keeps a plain value description. Initial rendering and disabled/reduced
motion remain static, subsequent value changes retain the half-second transition.

Both Progress components now have no HeroUI imports or types. Pixels' direct
`@heroui/progress` dependency is removed.

[ProgressCircular usage](../../packages/pixels/src/ProgressCircular/README.md)

## Tooltip

Tooltip uses React Aria trigger and tooltip behavior, with a span preserving its
existing trigger wrapper. Focusable children support keyboard focus, Escape and
blur. The owned recipe extends Popover's arrow geometry while preserving Tooltip's
medium radius, small shadow, section widths and existing slots. Entry and exit
feedback respect reduced motion. Pixels no longer declares `@heroui/tooltip`.

[Tooltip usage](../../packages/pixels/src/Tooltip/README.md)

## Menu

Menu uses React Aria's menu trigger and action collection, with overlay and positioning hooks
for positioning, scroll blocking and dismissal. The popup remains non-modal, so
outside controls can receive the interaction that dismisses it. The public Overlay portal
keeps the Element container contract. Trigger, collection and popup responsibilities
live in separate subcomponents, with owned recipes and explicit styling slots.

Sections remain labelled groups rather than nested submenus. Disabled options,
textValue typeahead, global key callbacks and item press events remain supported.
Styled triggers reuse Pixels Button with independent group defaults. Pixels no
longer declares `@heroui/button` or `@heroui/dropdown` directly.

[Menu usage](../../packages/pixels/src/Menu/README.md)

## Modal

Modal uses React Aria's dialog and modal overlay hooks with owned surface styles.
The visibility bridge retains closing content for exit feedback, while the dialog
engine owns focus containment, Escape, outside presses and page scroll locking.
Heading, body, footer and close control remain separate presentation components.

The controlled `isOpen`/`onClose` contract, imperative `modal` store, Element portal
container, sizes and existing styling slots remain supported. Body IDs are now
unique and point to the rendered body, fixing the previous description association.
Dialogs without a header receive a fallback accessible name. Reduced motion and
`disableAnimation` skip feedback. The eight captured light/dark states retain
their original dialog geometry.

Pixels no longer declares `@heroui/modal` directly or brings it in through Drawer.

Stacking tests open the next dialog above an already mounted one. Mounting
multiple initially open dialogs in the same render retains the previous engine’s
screen-reader visibility limitation, verified against the legacy Drawer engine.

[Modal usage](../../packages/pixels/src/Modal/README.md)

## Drawer

Drawer reuses Modal's dialog engine, sections and close control, with its own
edge placement, size, radius and backdrop recipe. Its controlled callbacks,
custom close button, Element portal and existing slots remain supported.
Disabling backdrop dismissal still leaves Escape available.

The shared engine keeps focus inside when pressing a nondismissible backdrop.
Its local viewport hook preserves visual-viewport sizing for mobile keyboards,
with window sizing as the fallback. Custom close elements retain their content
and handlers without nesting buttons. The `DefaultOpen` story now honors its
initial open state, and keyboard and dismissal scenarios live under their own
sidebar folders.

Pixels no longer declares `@heroui/drawer` directly. Modal and Drawer have no
HeroUI runtime or type imports. `pnpm check` now runs Pixels' direct TypeScript
check over component source, tests and stories as well as its declaration build.

[Drawer usage](../../packages/pixels/src/Drawer/README.md)

## Avatar

Avatar now owns image loading, its placeholder and fallback presentation. A new
source resets loading without allowing a previous request to reveal the next
image. Border, radius, size, disabled appearance and existing slots remain
available through the styling context. Presentational avatars remain outside
the tab order, while enclosing interactive wrappers keep their own semantics.

AvatarGroup supplies owned group membership for overlap and hover styling.

[Avatar usage](../../packages/pixels/src/Avatar/README.md)

## AvatarGroup

AvatarGroup now owns the overlapping row, optional wrappers and overflow indicator.
The `max={0}` unlimited mode, per-avatar disabled state, group sizing and
wrapper callbacks remain supported. Unlimited mode now omits the redundant
overflow indicator previously shown even when every avatar was visible. The compact visible plus retains its full
`+N` accessible name. Custom avatar slots now survive grouping instead of being
overwritten by the previous engine's child cloning.

The shared avatar dependency is removed. Both Avatar and AvatarGroup have no
HeroUI runtime or type imports.

[AvatarGroup usage](../../packages/pixels/src/AvatarGroup/README.md)

## Badge

Badge now owns its positioning container and indicator recipe. Undefined content
still returns children directly; zero, empty-string dots, single-character circles,
rich content, outlines and all four placements retain their behavior. Interactive
children retain their native keyboard handling. The size showcase now uses the
valid `md` value instead of its previous trailing-space typo.

The direct `@heroui/badge` dependency is removed.

[Badge usage](../../packages/pixels/src/Badge/README.md)

The light/dark comparison retains Avatar's 16 captured states and AvatarGroup's
geometry and colors across 14 states. Their WCAG audits found no violations in
those states. Badge retains its ten other captured states exactly; the two size
showcases reflect the corrected story argument. Its all-colors contrast findings
match the legacy baseline, with no new findings in the 12 audited states.

## Label

Label now owns its content, status dot, palette and treatment recipes. Public
props, callbacks and existing slots remain supported, with an additional
`endContent` slot for trailing element styling. The close action uses React Aria's
native Button, retaining the existing `close chip` name and press event callback.
The caller still owns removal, and closing never submits an enclosing form.

The active-filter consumer now places its edit and close actions alongside each
other instead of nesting a close control inside an edit button. Its browser
regression covers opening with Enter, dismissal with Escape and removal without
reopening the editor. Consumers should likewise keep removable labels outside
other buttons.

All 18 captured standard light/dark states and 12 palette/treatment matrix
screenshots match the legacy appearance. Accessibility audits of the standard
states retain the existing palette contrast findings, with no new violations.
The direct `@heroui/chip` dependency and Label's HeroUI theme import are removed.

[Label usage](../../packages/pixels/src/Label/README.md)

## Accordion

Accordion now owns selection, heading associations, keyboard navigation and
animated panel presentation, using React Aria buttons. Single/multiple and
controlled/uncontrolled expansion, required selection and all four treatments
remain supported. String and numeric index keys resolve consistently. Panel
content unmounts after closing, and reduced motion skips height animation.

The exposed `hideIndicator` option is now honored, fixing its previous omission.
`dividerProps` remains accepted with owned types, while the existing group-slot
borders continue to render dividers. The direct `@heroui/accordion` dependency
is removed.

The 26 captured light/dark states retain their dimensions, colors and typography.
Accessibility findings match the baseline, including the existing dark custom-style
contrast finding. Keyboard stories exercise disabled-item skipping and expansion.

[Accordion usage](../../packages/pixels/src/Accordion/README.md)

## Alert

Alert now owns its status icons, message layout, palette and dismissal state.
Both `closable` and the existing `onClose`-only behavior show a native React Aria
close action. Dismissal hides the message, calls the owner once and does not
submit enclosing forms. Titles, multiline descriptions, numeric zero, trailing
content and existing styling slots remain supported. The `icon` slot now reaches
the actual icon instead of being ignored by the previous wrapper.

All 16 captured light/dark screenshots match the baseline. Accessibility findings
are unchanged, including existing contrast findings in the trailing-content and
background showcases. Keyboard dismissal is exercised in an interaction story.

The direct `@heroui/alert` dependency and Alert's HeroUI theme import are removed.

[Alert usage](../../packages/pixels/src/Alert/README.md)

## Breadcrumb

Breadcrumb now owns its navigation landmark, item rendering, collapse policy and
styling, with React Aria hooks for associations and focus. Public content-only
items, disabled behavior, treatments, sizes and separators remain supported.
The current page stays outside tab navigation. Long paths keep the first and
last two items, with the same collapse threshold as before.

The collapsed indicator now has an accessible name and correctly receives the
public `ellipsis` styling slot, previously mapped to `separator` by the wrapper.
All 12 captured light/dark screenshots match the baseline. The collapsed-item
name fixes the previous accessibility finding, existing contrast findings are
unchanged. A keyboard story verifies Tab skips disabled items and the current page.
The direct `@heroui/breadcrumbs` dependency is removed.

[Breadcrumb usage](../../packages/pixels/src/Breadcrumb/README.md)

## Card

Card now renders its own content surface, header, body, footer and native dividing
rules. Existing props, section test IDs, forwarded div refs and all five styling
slots remain supported. The outer surface accepts programmatic focus without
adding a tab stop, while contained controls keep their own keyboard interactions.
No additional wrapper or presentation-only subcomponent is introduced.

All six captured light/dark screenshots match the baseline. Accessibility audits
retain the existing custom-styling contrast finding, with no new violations.
The keyboard story verifies the surface adds no tab stop and contained actions
remain operable.

The direct `@heroui/card` and now-unused `@heroui/divider` dependencies are removed.

[Card usage](../../packages/pixels/src/Card/README.md)

## SearchInput

SearchInput now owns its input surface and styling using React Aria TextField
and Button. Its local initial-value behavior, size options, test IDs and existing
slots remain supported. Explicit clearing reports `null`, ordinary deletion
reports an empty string. Clearing restores focus and does not submit forms.
The placeholder names the control, with `Search` as the fallback for an empty
placeholder, fixing the previous blank accessible name.

All 12 captured light/dark screenshots match the baseline. Accessibility audits
confirm the previous blank-name findings are resolved, with no new violations.

The direct `@heroui/input` dependency is removed. Existing `inputVariants` imports
remain valid and the recipe is now also exported from the component entry point.

[SearchInput usage](../../packages/pixels/src/SearchInput/README.md)

## Tabs

Tabs now uses the React Aria tabs engine with owned list, control, cursor and panel
styles. Controlled/default selection, numeric keys, both disabled-item APIs,
placement, sizes and the seven existing slots remain supported. Inactive panels
unmount by default, retained panels remain inert while hidden. The selection
indicator uses React Aria's shared-element transition with reduced-motion support.

The 16 captured light/dark states retain their layout, colors and typography.
Accessibility findings match the baseline, including existing contrast findings
in the dark radius, size and treatment showcases.

The direct `@heroui/tabs` dependency is removed. Tabs without an explicit label
use `Tabs` as the accessible list name.

[Tabs usage](../../packages/pixels/src/Tabs/README.md)

## Table

Table now owns its native table markup, recipes and optional scrolling surface.
React Aria hooks provide grid, column, row and cell associations and keyboard
navigation. The full collection remains registered during virtualization while
only a bounded row window and the focused row are mounted. Native spacer rows
preserve content-based column sizing and remain hidden from assistive technology.
Virtual defaults stay at 600 pixels for the surface and 40 pixels per data row.

Existing columns, row values, separation treatments, wrapper/header options,
loading/empty content and slots remain supported. Loading now also marks the grid
busy and announces its content. Selection and sorting remain outside the public
API. The direct `@heroui/table` dependency is removed.

All 14 captured light/dark screenshots match the baseline exactly. Accessibility
findings are unchanged, including the existing light-mode heading contrast
findings. Browser stories exercise cell navigation, bounded virtual scrolling,
end-to-end row/cell keyboard jumps and return to the column headings.

[Table usage](../../packages/pixels/src/Table/README.md)

## Final theme and dependency cleanup

Pixels no longer declares HeroUI or an unused direct Framer Motion dependency.
Pixel Motion still owns its actual animation dependency. The shared Tailwind
configuration scans workspace source only, and pixel-utils no longer exports
`heroui` or bundles its types. The lockfile is pruned of HeroUI packages.

This completes the repository migration. The setup change is intentionally
breaking: applications must import `@fuf-stack/pixel-utils/tokens.css` after
Tailwind and scan the built packages they use. Replace custom `--heroui-*`
overrides with `--pixel-*` variables. See the [styling setup](../styling.md#semantic-tokens)
and [pixel-utils migration](../../packages/pixel-utils/README.md#migration-from-the-heroui-plugin).

All published tarballs are checked for HeroUI dependencies, runtime imports,
declaration references and CSS variables. Application and Uniform stories run
against the same plugin-free setup as Pixels.

Before/after captures for 24 representative Pixels and Uniform light/dark states
are byte-identical, including a fresh Storybook process without the plugin.
Accessibility violation types and affected-element counts are unchanged, with
only existing contrast findings in these states.
