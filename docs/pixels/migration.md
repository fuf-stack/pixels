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

Menu and Popover still import `@heroui/button`, so Pixels must retain that direct
dependency. Other Pixels components and the shared theme still need migration.
Button and ButtonGroup no longer import HeroUI runtime components or types.

[Button](../../packages/pixels/src/Button/README.md) · [ButtonGroup](../../packages/pixels/src/ButtonGroup/README.md) · [Styling](../styling.md) · [Migration inventory](../heroui-removal.md)
