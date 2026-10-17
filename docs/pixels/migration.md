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

### Remaining scope

Menu still imports `@heroui/button`, so Pixels must retain that direct
dependency. Other Pixels components and the shared theme still need migration.
Button and ButtonGroup no longer import HeroUI runtime components or types.

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
still bring it in transitively. Popover's scrollable body continues to use the
existing ScrollShadow component, whose own HeroUI migration is separate.
`@heroui/button` remains for Menu.

[Popover usage and slots](../../packages/pixels/src/Popover/README.md)
