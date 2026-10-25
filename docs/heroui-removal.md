# HeroUI removal: implementation inventory

Status: complete in this repository. Uniform, Pixels and workspace consumers use
owned rendering, tokens and configured styling. HeroUI dependencies, the public
plugin re-export and workspace plugin/source scanning are removed. This remains
an intentionally breaking release for consumers that used the old plugin or hooks.
Uniform’s final cleanup and verification are recorded in the
[completion review](./uniform/migration-review.md). The dated sections below are
historical implementation notes; use that review and the current Uniform guides
for its final structure and remaining release constraints.
The agreed breaking changes include consumer theme setup and removal of
`uniform/hooks/useInput`, `uniform/hooks/useUniformField` and
`uniform/hooks/useUniformFieldArray`, including their public compatibility types
and getters. The user confirmed that consumers do not use the latter two hooks
and authorized removal of the known Markdown editor hook dependency. Production
component props, recipes, slots and storage contracts remain compatible.

## Pixels Button and ButtonGroup

Button and ButtonGroup now use React Aria interaction handling and owned recipes.
Their public component imports and existing group precedence are preserved.
See [Pixels migration notes](./pixels/migration.md) for composition and remaining
HeroUI consumers. The original inventory below records the pre-migration source.

## Pixels Popover

Popover now uses React Aria dialog components and overlay hooks with owned slot
styles. Pixels no longer declares `@heroui/popover` directly. Its scrollable body also uses the owned ScrollShadow implementation. Menu also uses owned trigger and overlay rendering. See the
[Popover migration notes](./pixels/migration.md#popover).

## Pixels ScrollShadow

ScrollShadow now owns its native scroll container, edge measurement and mask
recipe. Its direct HeroUI dependency is removed, including the remaining HeroUI
rendering inside Popover. See [Pixels migration notes](./pixels/migration.md#scrollshadow).

## Pixels Progress

Linear Progress now uses React Aria semantics, owned slot styles and activity
animation. ProgressCircular now owns its rendering too, removing the direct
`@heroui/progress` dependency.
See [Pixels migration notes](./pixels/migration.md#progress).

## Pixels ProgressCircular

ProgressCircular owns its SVG ring, value and status icon styling, with React Aria
range semantics. Both progress components now have no HeroUI imports or types.
See [Pixels migration notes](./pixels/migration.md#progresscircular).

## Pixels Tooltip

Tooltip now uses React Aria trigger and overlay behavior with owned surface styles.
The span wrapper, placement names, delays and section slots remain supported.
The direct `@heroui/tooltip` dependency is removed.
See [Pixels migration notes](./pixels/migration.md#tooltip).

## Pixels Menu

Menu now uses React Aria action collections and the popover hook, with owned
trigger and option styling. Grouped actions, disabled options, press callbacks,
typeahead and Element portals remain supported. Direct `@heroui/button` and
`@heroui/dropdown` dependencies are removed.
See [Pixels migration notes](./pixels/migration.md#menu).

## Pixels Modal

Modal now uses owned surface recipes with React Aria dialog and modal overlay
hooks. Controlled and imperative APIs, Element portals and scroll locking remain
supported, and body descriptions reference unique rendered IDs. The direct
`@heroui/modal` dependency is removed.
See [Pixels migration notes](./pixels/migration.md#modal).

## Pixels Drawer

Drawer now shares Modal's owned dialog engine with its own placement and size
recipe. Custom close elements, Element portals and existing styling slots remain
supported. The direct `@heroui/drawer` dependency is removed.
See [Pixels migration notes](./pixels/migration.md#drawer).

## Pixels Avatar

Avatar now owns image loading and fallback rendering with owned slot recipes.
AvatarGroup now owns overlap, wrappers and its accessible overflow indicator.
The direct `@heroui/avatar` dependency is removed.
See [Pixels migration notes](./pixels/migration.md#avatar).

## Pixels Badge

Badge now owns its positioning, content sizing and slot styles. Its direct
`@heroui/badge` dependency is removed.
See [Pixels migration notes](./pixels/migration.md#badge).

## Pixels Label

Label now owns its recipes and uses a native React Aria close button. The active
filter consumer keeps edit and close actions separate. The direct `@heroui/chip`
dependency and Label's HeroUI theme import are removed.
See [Pixels migration notes](./pixels/migration.md#label).

## Pixels Accordion

Accordion now owns expansion, heading associations and animated panels with
React Aria trigger interactions. The direct `@heroui/accordion` dependency is
removed. See [Pixels migration notes](./pixels/migration.md#accordion).

## Pixels Alert

Alert now owns its message layout, icons, palette and native close action.
The direct `@heroui/alert` dependency and Alert's HeroUI theme import are removed.
See [Pixels migration notes](./pixels/migration.md#alert).

## Pixels Breadcrumb

Breadcrumb uses owned recipes and React Aria hooks for its landmark and item
associations. The direct `@heroui/breadcrumbs` dependency is removed. See the
[Pixels migration notes](./pixels/migration.md#breadcrumb).

## Pixels Card

Card renders owned surfaces and section dividers. Its direct `@heroui/card` and
unused `@heroui/divider` dependencies are removed. See the
[Pixels migration notes](./pixels/migration.md#card).

## Pixels SearchInput

SearchInput owns its editable surface, clear action and recipes. Its direct
`@heroui/input` dependency is removed. See the
[Pixels migration notes](./pixels/migration.md#searchinput).

## Pixels Tabs

Tabs owns its recipes and composes React Aria tab controls, panels and selection
indicators. Its direct `@heroui/tabs` dependency is removed. See the
[Pixels migration notes](./pixels/migration.md#tabs).

## Pixels Table

Table owns native grid rendering and virtual row windows, with React Aria hooks
for keyboard navigation and associations. Its direct `@heroui/table` dependency
is removed. Pixels components now have no HeroUI runtime/type imports. Shared
theme, plugin/source configuration and unused dependency cleanup are complete.
See the [Pixels migration notes](./pixels/migration.md#table).

## Implemented foundation

- `TVProps` uses direct Tailwind Variants types.
- Existing standalone `cn` retains its old classification during coexistence.
  The new instance helpers share owned semantic merge rules; migrate component
  call sites and compare visuals before unifying the legacy export.
- `createStyling` owns an isolated Tailwind Merge instance shared by application
  `cn`, recipes, and slot resolution. Recipe defaults, selected variants,
  compounds, extension, and caller slot classes reach final merging together.
- `StylingProvider` lives in Pixels; `useStyling` follows React portals and
  isolates application roots and SSR renders. Default helpers remain available.
- Tests cover `text-body` as a font size while preserving `text-danger`, arrays,
  slot records, responsive/state/important/arbitrary utilities, custom groups,
  directional conflicts, compounds, extension, inferred variants, portals, SSR,
  and prose utilities. The provider has a browser Storybook regression.

The implementation uses the installed Tailwind Variants 3.2.2 lite entry point.
Its normal entry point stores the effective merge function in shared module
state; `createTV` alone therefore does not provide isolated merge instances.
Recipes retain raw metadata for extension. `resolve(recipe, props)` evaluates
pixel-utils recipes using the consuming instance before slot classes merge.
It cannot recover classes already discarded by an external HeroUI recipe.

## Initial source inventory

This table records the migration baseline, including the original HeroUI imports
and story counts. Completed migrations are tracked above. It records explicitly
declared slots, not inherited HeroUI slots. The
linked source is authoritative for public props, defaults, variants and callbacks;
all component export paths in each package manifest must stay stable. A zero
story count means no same-directory story, not necessarily no consumer coverage.
This inventory does **not** certify DOM or visual compatibility. Those checks
must accompany each renderer migration, with before/after browser evidence.

| Component               | Props/source                                                                             | Recipe                   | Explicit slots                                                                                                                                                                                                                                                                                                                                                                                                                                 | Direct HeroUI modules | Story files |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| pixels/Accordion        | [AccordionItemProps, AccordionProps](../packages/pixels/src/Accordion/Accordion.tsx)     | accordionVariants        | base, content, heading, indicator, startContent, subtitle, title, titleWrapper, trigger, wrapper                                                                                                                                                                                                                                                                                                                                               | divider, accordion    | 1           |
| pixels/Alert            | [AlertProps](../packages/pixels/src/Alert/Alert.tsx)                                     | alertVariants            | base, closeButton, description, endContent, icon, iconWrapper, mainWrapper, title                                                                                                                                                                                                                                                                                                                                                              | alert, theme          | 1           |
| pixels/Avatar           | [AvatarProps](../packages/pixels/src/Avatar/Avatar.tsx)                                  | avatarVariants           | base, fallback, icon, img, name                                                                                                                                                                                                                                                                                                                                                                                                                | avatar                | 1           |
| pixels/AvatarGroup      | [AvatarGroupProps](../packages/pixels/src/AvatarGroup/AvatarGroup.tsx)                   | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | avatar                | 1           |
| pixels/Badge            | [BadgeProps](../packages/pixels/src/Badge/Badge.tsx)                                     | badgeVariants            | badge, base                                                                                                                                                                                                                                                                                                                                                                                                                                    | badge                 | 1           |
| pixels/Breadcrumb       | [BreadcrumbItemProps, BreadcrumbProps](../packages/pixels/src/Breadcrumb/Breadcrumb.tsx) | breadcrumbVariants       | ellipsis, item, itemBase, list, separator, nav                                                                                                                                                                                                                                                                                                                                                                                                 | breadcrumbs           | 1           |
| pixels/Button           | [ButtonProps](../packages/pixels/src/Button/Button.tsx)                                  | buttonVariants           | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | button, theme         | 1           |
| pixels/ButtonGroup      | [inferred/re-exported](../packages/pixels/src/ButtonGroup/ButtonGroup.tsx)               | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | button                | 1           |
| pixels/Card             | [CardProps](../packages/pixels/src/Card/Card.tsx)                                        | cardVariants             | base, body, divider, footer, header                                                                                                                                                                                                                                                                                                                                                                                                            | card, divider         | 1           |
| pixels/Drawer           | [DrawerProps](../packages/pixels/src/Drawer/Drawer.tsx)                                  | drawerVariants           | wrapper, base, backdrop, header, body, footer, closeButton                                                                                                                                                                                                                                                                                                                                                                                     | —                     | 1           |
| pixels/Label            | [LabelProps](../packages/pixels/src/Label/Label.tsx)                                     | labelVariants            | base, closeButton, content, dot, icon                                                                                                                                                                                                                                                                                                                                                                                                          | chip, theme           | 1           |
| pixels/Menu             | [MenuProps](../packages/pixels/src/Menu/Menu.tsx)                                        | menuVariants             | item, trigger                                                                                                                                                                                                                                                                                                                                                                                                                                  | button, dropdown      | 1           |
| pixels/Modal            | [ModalProps](../packages/pixels/src/Modal/Modal.tsx)                                     | modalVariants            | backdrop, base, body, closeButton, footer, header, wrapper                                                                                                                                                                                                                                                                                                                                                                                     | —                     | 1           |
| pixels/Popover          | [PopoverProps](../packages/pixels/src/Popover/Popover.tsx)                               | popoverVariants          | body, content, divider, footer, footerWrapper, header, headerWrapper, trigger                                                                                                                                                                                                                                                                                                                                                                  | button, popover       | 1           |
| pixels/Progress         | [ProgressProps](../packages/pixels/src/Progress/Progress.tsx)                            | progressVariants         | base, indicator, label, labelWrapper, track, value                                                                                                                                                                                                                                                                                                                                                                                             | progress              | 1           |
| pixels/ProgressCircular | [ProgressCircularProps](../packages/pixels/src/ProgressCircular/ProgressCircular.tsx)    | progressCircularVariants | base, indicator, label, svg, svgWrapper, track, value                                                                                                                                                                                                                                                                                                                                                                                          | progress, theme       | 1           |
| pixels/ScrollShadow     | [ScrollShadowProps](../packages/pixels/src/ScrollShadow/ScrollShadow.tsx)                | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | scroll-shadow         | 1           |
| pixels/SearchInput      | [SearchInputProps](../packages/pixels/src/SearchInput/SearchInput.tsx)                   | inputVariants            | base, clearButton, input, inputWrapper                                                                                                                                                                                                                                                                                                                                                                                                         | input                 | 1           |
| pixels/Table            | [TableColumnProps, TableRowProps, TableProps](../packages/pixels/src/Table/Table.tsx)    | tableVariants            | base, wrapper, table, thead, tbody, tr, th, td, tfoot, sortIcon, emptyWrapper, loadingWrapper                                                                                                                                                                                                                                                                                                                                                  | table                 | 1           |
| pixels/Tabs             | [TabProps, TabsProps](../packages/pixels/src/Tabs/Tabs.tsx)                              | tabsVariants             | base, cursor, panel, tab, tabContent, tabList, tabWrapper                                                                                                                                                                                                                                                                                                                                                                                      | tabs                  | 1           |
| pixels/Tooltip          | [TooltipProps](../packages/pixels/src/Tooltip/Tooltip.tsx)                               | tooltipVariants          | base, body, content, divider, footer, footerWrapper, header, headerWrapper, trigger                                                                                                                                                                                                                                                                                                                                                            | tooltip               | 1           |
| uniform/Checkboxes      | [CheckboxesProps](../packages/uniform/src/Checkboxes/Checkboxes.tsx)                     | checkboxesVariants       | base, errorMessage, label, optionBase, optionIcon, optionLabel, optionLabelSubline, optionWrapper, wrapper                                                                                                                                                                                                                                                                                                                                     | —                     | 2           |
| uniform/DatePicker      | [DatePickerProps](../packages/uniform/src/DatePicker/DatePicker.tsx)                     | datePickerVariants       | base, helperWrapper, calendar, calendarContent, inputWrapper, label, popoverContent, selectorButton, selectorIcon, timeInput, timeInputLabel                                                                                                                                                                                                                                                                                                   | —                     | 2           |
| uniform/FieldArray      | [inferred/re-exported](../packages/uniform/src/FieldArray/FieldArray.tsx)                | fieldArrayVariants       | base, actionsMenuButton, appendButton, elementFieldsGrid, label, list, listWrapper, listItem, listItemInner, removeButton, sortDragHandle                                                                                                                                                                                                                                                                                                      | —                     | 2           |
| uniform/FieldCard       | [FieldCardProps](../packages/uniform/src/FieldCard/FieldCard.tsx)                        | fieldCardVariants        | base, label, content, errorFooter, errorText                                                                                                                                                                                                                                                                                                                                                                                                   | —                     | 3           |
| uniform/Form            | [FormProps](../packages/uniform/src/Form/Form.tsx)                                       | formVariants             | base, debugViewer, debugViewerCopyButtonToggle, debugViewerHeader, debugViewerJson, debugViewerTriggerButton, form                                                                                                                                                                                                                                                                                                                             | —                     | 1           |
| uniform/Input           | [InputProps](../packages/uniform/src/Input/Input.tsx)                                    | inputVariants            | base, clearButton, description, errorMessage, helperWrapper, innerWrapper, input, inputWrapper, label, stepper, stepperButton                                                                                                                                                                                                                                                                                                                  | —                     | 3           |
| uniform/RadioBoxes      | [RadioBoxesProps](../packages/uniform/src/RadioBoxes/RadioBoxes.tsx)                     | radioBoxesVariants       | base, boxBase, boxControl, boxDescription, boxLabel, boxLabelWrapper, label, wrapper                                                                                                                                                                                                                                                                                                                                                           | —                     | 2           |
| uniform/RadioTabs       | [RadioTabsProps](../packages/uniform/src/RadioTabs/RadioTabs.tsx)                        | radioTabsVariants        | base, cursor, label, tab, tabBase, tabContent, tabList, tabPanel, tabWrapper, wrapper                                                                                                                                                                                                                                                                                                                                                          | —                     | 3           |
| uniform/Radios          | [RadiosProps](../packages/uniform/src/Radios/Radios.tsx)                                 | radiosVariants           | base, errorMessage, itemBase, itemControl, itemDescription, itemLabel, itemLabelWrapper, itemWrapper, label, wrapper                                                                                                                                                                                                                                                                                                                           | —                     | 2           |
| uniform/Select          | [SelectProps](../packages/uniform/src/Select/Select.tsx)                                 | selectVariants           | base, clearIndicator, control, control_focused, crossIcon, downChevron, dropdownIndicator, group, groupHeading, indicatorsContainer, indicatorSeparator, input, label, loadingIndicator, loadingMessage, menu, menuList, menuPortal, multiValue, multiValueContainer, multiValueLabel, multiValueRemove, noOptionsMessage, option, option_disabled, option_focused, option_selected, placeholder, selectContainer, singleValue, valueContainer | —                     | 3           |
| uniform/Slider          | [SliderProps](../packages/uniform/src/Slider/Slider.tsx)                                 | sliderVariants           | base, endContent, errorMessage, filler, label, labelWrapper, mark, startContent, step, thumb, track, trackWrapper, value                                                                                                                                                                                                                                                                                                                       | —                     | 3           |
| uniform/SubmitButton    | [SubmitButtonProps](../packages/uniform/src/SubmitButton/SubmitButton.tsx)               | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                     | 1           |
| uniform/Switch          | [SwitchProps](../packages/uniform/src/Switch/Switch.tsx)                                 | switchVariants           | base, endContent, errorMessage, label, outerWrapper, startContent, thumb, thumbIcon, wrapper                                                                                                                                                                                                                                                                                                                                                   | —                     | 2           |
| uniform/SwitchBox       | [SwitchBoxProps](../packages/uniform/src/SwitchBox/SwitchBox.tsx)                        | switchBoxVariants        | box, description, icon, label, wrapper, thumb, thumbIcon                                                                                                                                                                                                                                                                                                                                                                                       | —                     | 2           |
| uniform/TextArea        | [TextAreaProps](../packages/uniform/src/TextArea/TextArea.tsx)                           | textAreaVariants         | base, clearButton, input, inputWrapper                                                                                                                                                                                                                                                                                                                                                                                                         | —                     | 2           |
| uniform/Time            | [TimeProps](../packages/uniform/src/Time/Time.tsx)                                       | timeVariants             | base, helperWrapper, input, innerWrapper, inputWrapper, label, segment                                                                                                                                                                                                                                                                                                                                                                         | —                     | 2           |

Additional coupling:

- The old pixel-utils `heroui` export, declaration bundling rules, Tailwind
  plugin and HeroUI source globs are removed. `tokens.css` supplies the semantic
  theme in both workspace previews and packaged consumers.
- Pixels Toast uses Sonner already; retain its behavior and test interoperability
  with replacement overlays. Megapixels selection checkboxes now use React Aria,
  and the Base UI dependency has been removed.
- Uniform has no direct HeroUI dependencies or published HeroUI runtime/type
  references. Radio options, switch thumbs and date/time values use owned
  contracts. Legacy hook exports have been removed as an explicit breaking change.
- Atelier and Megapixels consume Pixels primitives and semantic utilities, even
  where they have no direct HeroUI imports. Audit published declarations and
  packed consumers as well as source imports.

## Field composition audit and migration gates

The private `useUniformField` core owns RHF registration, transformed
values, required-schema state, stable control IDs, test IDs, the debug label
button, error flattening and invalid visibility. Existing debounce, reduced-motion
and serialization behavior is retained. All production fields consume this core.
Public legacy adapters and their presentation getters have now been removed.
The state implementations and their behavioral coverage remain private.

`useUniformField` normalizes errors internally and returns a rendered
`errorMessage` using `FieldValidationError`. The raw/group `error` behavior remains
unchanged. `FieldValidationError` owns the message list, Pixel Motion entry/exit
animations and reduced-motion support. Field presentation owns visibility and the
styled wrapper associated with the control. Direct uses can supply `id` to
`FieldValidationError` for its optional association wrapper. Establish
stable control, label, description and error IDs once in the field hook, then
pass them to presentation, the editable element and React Aria contexts. Keep
native validation from competing with RHF/Veto.

| Slice                                   | Existing contract to preserve                                                                                                                | Verification gate                                                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Input/TextArea                          | Actual input ref, debounce flush on blur, controlled empty values, clear-to-null/reset, addons, sizes, existing four slots                   | RHF defaults/reset/transforms; every slot target; text/password/number keyboard and accessible names                           |
| Checkbox/radio/switch families          | Group and option slots, array/scalar transforms, required markers, disabled options, custom boxes/tabs and switch thumb renderer             | Fieldset/legend where appropriate; arrows/Space; focus refs; touched/error timing                                              |
| DatePicker/Time                         | UTC strings, date/time objects, numeric hours, zones, min/max limits, hour cycle, segments/calendar/time slots                               | Segment/popup focus must not trigger premature blur; serialization and clearing remain identical                               |
| Slider                                  | Numeric/array values, limits, marks, steps, thumb/value/track slots and formatting                                                           | Keyboard/pointer updates, ref/focus, touched/error and reset behavior                                                          |
| Select                                  | React Select engine, numeric option conversion, fallback options, search, multiselect, loading, clearing, callback types, all existing slots | Replace `useSelect` helper and parsed label IDs; names/error association on real input; preserve deferred touched notification |
| FieldArray/FieldCard/SubmitButton/debug | Shared primitives and public error/label partials                                                                                            | Recheck registration, array defaults/sorting and errors after the underlying primitives migrate                                |
| Pixels overlays                         | Modal/drawer/popover/menu focus, portals, Escape, scroll locking, stacking and toast behavior                                                | Select/calendar inside overlays; restoration and keyboard/automated accessibility                                              |

Committed story DOM snapshots and existing behavioral tests are the current
source baseline. The [verification summary](./uniform/migration-verification.md)
retains the visual-review scope and unresolved accessibility findings after
removal of one-time screenshots and JSON reports. All Uniform production fields,
Pixels primitives and workspace consumers are migrated, with per-slice history
below.

The production React Aria text/number Input consumes a shared field-state core
without calling legacy presentation hooks. Private shared state supports all
production fields; the former public adapters are removed. Production input tests cover
registration, resets, blur/submission flushing, pending-edit cancellation on
clear, focus restoration, decimal/zero/empty numbers, stepper updates, labels,
required markers, errors and consumer font-size merging. The form's existing
empty-field serialization remains unchanged. Local label and hint components
own presentation only and are not public entry points.

## Completed sequence and release prerequisites

1. Uniform's production-field, React Select and internal consumer scope is
   complete. Preserve its committed behavior, visual evidence and packed API
   fixtures while migrating the lower-level consumers.
2. Pixels component rendering is migrated to owned tokens and configured styling.
   Preserve overlay interoperability, public slots, refs, keyboard behavior and
   visual fixtures during the remaining integration cleanup.
3. Atelier and Megapixels retain their existing implementations and are checked
   against the migrated Pixels dependencies.
4. Unused HeroUI dependencies, plugin/scanning, theme exports and inherited
   recipes are removed, including published runtime and declaration references.
5. Uniform's legacy hook exports are removed with migration guidance. The user
   confirmed no external use of the two Uniform field hooks. The known Markdown
   editor must replace its old `useInput` import when adopting the breaking
   release; its source remains outside this repository.
6. Run the full check, packed declarations/export/dependency audit, visual and
   keyboard/accessibility review. Release foundations before Pixels, then Uniform
   and consumers; Release Please owns versions and changelogs.

See [styling](./styling.md), [agent workflows](./agent-workflows.md), and
[release workflow](./package-release-workflow.md).

## Foundation verification (2026-10-14)

`pnpm install --frozen-lockfile` and `pnpm exec playwright install chromium`
completed. Final `pnpm check` passed all six gates: dependency boundaries, lint,
builds, 1,470 unit tests (12 skipped), 430 browser Storybook tests, and packed
consumer verification for all seven published packages. The packed consumer
fixture checks variant/slot inference, extension and the provider’s public type.
Existing snapshots were not updated. No manual keyboard/assistive-technology
review or before/after screenshot capture was performed; those remain gates for
the upcoming renderer/theme migration.

## Token foundation verification

`pnpm check` passed all six gates after adding the exported, side-effectful
stylesheet and plugin-free packed CSS consumer. The consumer verifies semantic
colors, font sizes, radii, border widths (including directional utilities),
opacity, responsive/dark utilities and source discovery from compiled package
files. Storybook continues to use the transitional HeroUI setup until renderer
slices adopt the owned stylesheet.

## Private input prototype verification

`pnpm check` passed all six gates with the shared state core and private React
Aria input prototype: 1,483 unit tests (12 skipped), 441 browser stories, and
clean packed consumers for seven published packages. Existing production DOM
snapshots were retained. Ten visual comparisons match the captured input
metrics. Keyboard, clear, numeric stepper, error focus and provider merging are
covered by prototype stories/tests. Automated accessibility findings and their
baseline comparison are recorded with the field evidence; invalid-state
contrast remains unresolved. Other field families and production promotion
remain pending. The external Markdown editor is deferred at the user's request.

## Production Input rollout verification

`Input` now renders owned React Aria text/password/number controls. All four
public styling slots and existing props remain available; consumer merge
configuration applies before classes are discarded. The old private prototype
was removed and its focused stories/tests now exercise production composition.
The unused `@heroui/number-input` dependency was removed. Twenty-four visual
comparisons match the legacy measurements, including sizes, addons, custom
styles and focused/hovered inputs. Sixty-three affected consumer DOM snapshots
were reviewed and updated; behavior assertions were retained.

Final `pnpm check` passed all six gates with 1,486 unit tests (12 skipped),
434 browser stories and seven packed consumers. The browser story count is
lower because seven prototype duplicates were removed. The packed fixture also
checks the production input prop/slot/transform declarations. Accessibility
findings remain identical to the captured invalid-state baseline. TextArea,
other field families, Pixels primitives and final HeroUI/theme removal remain
pending.

## Production TextArea rollout verification

`TextArea` now uses owned markup, React Aria field behavior and the same
three-to-eight-row autosizing engine declared as a direct dependency. Existing
props, four slot names, controlled values and debounce/reset behavior remain
available. Optional help text and visible errors are associated with the actual
textarea. Eight light/dark comparisons match the previous editable and wrapper
measurements. The shared text-field layout also restores original error spacing;
Input and TextArea browser stories now assert the control-to-error boundary.

Final `pnpm check` passed all six gates: 1,491 unit tests (12 skipped), 438
browser stories and seven packed consumers. Browser tests now compile Tailwind
utilities through the same plugin as the development preview, so live autosizing
and typography assertions exercise real utility styles. Packed declarations
check TextArea props and slots. The textarea audit records invalid-state text
contrast findings in both themes; its other audited states have no findings.
Pixels primitives, grouped/date/time/slider fields, Select integration and final
HeroUI/theme removal remain pending.

## Uniform-only phase and Select integration (2026-10-15)

The current phase covers remaining Uniform fields, React Select integration and
Uniform consumers. Pixels primitives and application package migrations remain
outside this phase; they continue to supply HeroUI-backed presentation until a
later rollout. The external Markdown editor remains deferred.

Select keeps React Select while removing HeroUI select/input-presentation hooks
from its production path. Actual input associations preserve the engine’s own
placeholder/live-region descriptions. Declared icon/container slots now target
their intended elements, configured font-size merging is checked in a browser,
and numeric values, fallback options, transforms and deferred touched timing
are retained. The unused `@heroui/select` dependency is removed.

All 16 light/dark control/wrapper measurement comparisons match the baseline.
Final `pnpm check` passed all six gates: 1,495 unit tests (12 skipped), 440 browser
stories and seven packed consumers. Twenty-four consumer snapshots were updated
for the intentional association/slot wiring changes; behavior assertions were
retained. Select accessibility findings are recorded with its field evidence.

## Production Switch verification (2026-10-15)

Switch now uses React Aria hooks with owned presentation and one registered
input. Keyboard/pointer interaction, boolean false/true submission, defaults,
reset, disabled behavior, actual invalid-submit focus and thumb callback types
are verified. Public styling slots remain available; the declared thumb props
are local structural types. Sixteen light/dark comparisons match the baseline
track/thumb geometry, colors, typography and positions. Eleven consumer DOM
snapshots were updated without changing their behavior assertions.

Final `pnpm check` passed all six gates with 1,498 unit tests (12 skipped), 441
browser stories and seven packed consumers. The audit records light-mode
invalid-state contrast; all other audited states have no findings. The remaining
Uniform field families and group consumers still need their production slices.

## Owned group consumers (2026-10-15)

FieldArray and FieldCard now render their own headings and error footers using
configured styling. Their groups reference visible heading IDs; FieldCard also
associates its object-level footer. Required markers are hidden from accessible
names. Child registration, object/array error visibility, touched/submitted
styling, reset normalization and array operations retain their existing behavior.
The public array hook retains legacy getters while the production component uses
a private state path; both share the same array methods and effects.

Fourteen light/dark heading measurements match the captured baseline. Browser
stories check configured heading font merging; regression tests check group
names and child submission without invoking the legacy presentation hook.
The group audits record error-text contrast findings in both themes. Pixels
buttons, menus and drag controls used by arrays remain in the later Pixels phase.

Final `pnpm check` passed all six gates: 1,500 unit tests (12 skipped), 442 browser
stories and seven packed consumers. Thirty-one group/consumer snapshots were
reviewed and updated for the intentional DOM association changes.

## Production SwitchBox verification (2026-10-15)

SwitchBox uses React Aria interactions and one registered native input. Its
visible label and description now associate explicitly with that input; the
same input handles invalid-submit focus, Space toggling, blur and boolean
submission. Required markers are hidden from accessible names. Existing card,
track, thumb, icon and description slots remain configurable, including size
and thumb callback types. Its unused direct `@heroui/switch` dependency is removed.

Sixteen light/dark comparisons match the baseline geometry, colors and
typography, including icon positioning and all three sizes. Unit checks cover
false submission, reset, disabled behavior, required/help/error focus and thumb
callbacks; the browser story checks keyboard toggling. Existing consumer/reset
stories retain their behavior assertions while updating the intentional markup.

Final `pnpm check` passed all six gates with 1,503 unit tests (12 skipped), 443
browser stories and seven packed consumers. Eleven consumer DOM snapshots were
reviewed and updated. The audit records light invalid-state contrast; the other
audited SwitchBox states have no findings.

## Owned radio families (2026-10-15)

Radios and RadioBoxes now use owned React Aria radio groups and option controls.
Their existing option descriptors, custom list rendering, numeric conversion,
registered values, reset behavior, disabled options and styling slots remain
available. Label/help/error IDs associate with the group and editable inputs;
invalid submission focuses an enabled input. RadioBoxes also associates option
descriptions. The compatibility-only RadioBox prop type still references the
existing HeroUI type; its production renderer no longer invokes HeroUI hooks.

RadioTabs now owns its tab engine and presentation within Uniform. Investigation
of the existing #1873 runner hang found an infinite loop in the older Tabs
keyboard delegate when every tab is disabled. The React Aria foundation already
used by Uniform has the terminating traversal. Moving RadioTabs onto it fixes
that case without changing Pixels. All eleven previously excluded RadioTabs
stories now run in both snapshot and browser suites. Numeric/boolean values,
conditional panels, reset, keyboard selection, disabled state and actual error
focus are checked; disabled RHF fields retain their existing submission omission.
Its public slots and four variants remain available, with measured cursor
placement and reduced-motion styling. The tab selection field uses a named group
and tab list rather than an empty radiogroup. Required selection is described
accessibly, and help/errors associate with the editable tabs.

All 18 captured light/dark group/option geometry comparisons match the baseline.
Browser checks additionally cover configured option typography and all four tab
variants. The 22-state accessibility audit records invalid-state contrast;
other audited states have no findings. Pixels and application migrations remain
outside this phase.

Final `pnpm check` passed all six gates: 1,523 unit tests (one skipped), 460 browser
stories and seven packed consumers. The DataTable filter consumer snapshot was
updated for the owned radio markup; no application implementation was migrated.

## Owned Checkboxes (2026-10-15)

Checkboxes now uses React Aria with owned group, option, icon and error markup.
Array values, optional clearing, scalar/object transforms, custom option
rendering/metadata, per-option and group disabled behavior, colors and
line-through styling are retained. Group and option descriptions associate with
the actual inputs; invalid submission focuses the first enabled checkbox.
Requiredness belongs to the selection group, is described accessibly and does
not impose native required validation on every option. RHF remains authoritative.
Existing slots now merge through the configured styling instance, including the
error-message slot. The direct `@heroui/checkbox` dependency is removed; the
Pixels table still retains that package transitively.

All 24 light/dark group/option geometry and typography comparisons match the
baseline, including sublines, line-through, custom layouts and transform stories.
The 28-state audit records invalid/sublabel/line-through contrast findings;
other audited states have no findings. Existing behavior assertions remain,
with added checks for native names, array/scalar submission, reset, optional
clearing, disabled omission, keyboard operation and actual error focus.

Final `pnpm check` passed all six gates: 1,528 unit tests (one skipped), 462 browser
stories and seven packed consumers. The DataTable filter modal and checkbox
consumer assertions pass unchanged, including ReactNode option names.

## Owned Slider (2026-10-15)

Slider now renders an owned React Aria control with one registered range input.
The input keeps the field's actual name and handles keyboard/pointer changes,
reset, disabled state and error focus. Programmatic focus through the field's
test-ID wrapper remains supported without adding a keyboard stop. Numeric
transforms, fractional steps, fill offsets, step dots, addons and public slots
remain available. Completing an explicit interaction at zero commits that value;
merely tabbing through an empty required slider still leaves it empty.

All 24 light/dark comparisons match baseline dimensions, typography and colors,
including all sizes, transforms, step dots and addons. Browser checks retain the
real-coordinate drag/release/submission regression and verify configured label
and thumb sizing. The 28-state audit records light invalid/disabled contrast;
other audited states have no findings. The unused direct `@heroui/slider`
dependency is removed. Time, DatePicker and remaining Uniform consumer styling
remain pending in this phase.

Final `pnpm check` passed all six gates: 1,531 unit tests (one skipped), 464 browser
stories and seven packed consumers. Existing drag/release and focus assertions
remain enabled.

## Owned Time (2026-10-15)

Time now owns its label, segmented input, helper and error presentation using
React Aria. Its public slots merge through the configured styling instance.
UTC minute strings, timezone conversion, 12/24-hour formatting, hour granularity,
numeric midnight and date/time object values retain their storage contracts.
The editable segments receive help, required and error associations; invalid
submission focuses the first enabled segment. RHF remains responsible for
validation and disabled-field submission omission.

Controlled empty values clear completed edits on reset. The explicit form-reset
signal also clears partial edits whose stored value is still empty, without
remounting the control. Behavior tests cover keyboard changes, initial/reset
values, both storage formats, numeric zero, disabled submission and error focus.
Browser stories cover configured segment typography and accessible help/errors.
All 22 light/dark layout, typography and color comparisons match the baseline.
The 26-state accessibility audit records contrast findings in invalid and
custom-color stories; other audited states have no findings. Invalid submission
now visibly focuses the first editable segment. DatePicker and remaining
Uniform consumer styling are the next slices.

Final `pnpm check` passed all six gates: 1,536 unit tests (one skipped), 466 browser
stories and seven packed consumers. The all-field-renderers example snapshot
was updated for the owned Time markup.

## Owned DatePicker (2026-10-15)

DatePicker now owns its segmented field, calendar popup, navigation, day cells
and time footer using React Aria. All public styling slots remain available and
merge through the configured styling instance. UTC string conversion, date
object output, timezone interpretation, 12/24-hour cycles, min/max calendar
limits and disabled submission omission are retained. Date/time fields explicitly
preserve the previous leading-zero formatting. The shared segment defaults are
private to Uniform; public recipe exports remain unchanged.

Help and schema errors associate with editable segments; invalid submission
focuses the first segment. Partial and completed edits clear on explicit reset.
Tests cover UTC keyboard edits, date-object output, reset, required errors,
disabled fields, calendar limits and selection, popup focus return, keyboard
navigation and time-footer changes. Date-time selection keeps the popup open for time editing; date-only selection
closes it. The time footer retains its supplied time limits. All 24 light/dark field comparisons and eight
calendar dimensions match their baselines. The 36-state field/popup accessibility
audit records contrast findings in invalid/custom-color fields and the light
time footer; other audited states have no findings.

Unused direct HeroUI date-input/date-picker dependencies and their orphaned
calendar entries are removed, with frozen-lockfile installation verified.
Production fields no longer invoke the public legacy presentation adapter.
Public adapter exports remain for compatibility; external Markdown editor work
is deferred. Internal Uniform consumer styling is next; Pixels/application and
final theme removal are outside this phase.

Final `pnpm check` passed all six gates: 1,542 unit tests (one skipped), 470 browser
stories and seven packed consumers. Existing DatePicker/Time and all-field
consumer snapshots were updated for the owned markup and retained formatting.

## Remaining Uniform styling consumers (2026-10-15)

Form, its debug viewer, Grid, array element wrappers/actions/drag handles,
SubmitButton and the test-ID copy button now use the configured styling instance.
Every Uniform-owned runtime class merge follows the provider; exported recipes,
props and slots remain compatible. Pixels-backed controls still retain Pixels'
current renderer behavior, which belongs to its later migration phase.

The new browser fixture verifies actual 18px consumer typography through Form,
Grid and nested array wrappers while preserving semantic color classes. Before
this pass, the same configured classes collapsed to the 14px default. The
uncustomized light/dark layout is unchanged in the captured evidence. The debug
viewer also has a regression at its Pixels Card boundary. The array drag handle
now has an accessible name, with a browser regression. The four-state audit
confirms the naming issue is resolved; remaining findings are contrast in the
Pixels submit button and the light custom-danger-color fixture. Existing form,
array-action, sorting, submit and debug subscription tests remain enabled.

This completes the requested Uniform production-field, React Select integration
and internal consumer scope. Public `useInput`/legacy field adapter exports and
the RadioBox compatibility type remain intentionally available. The external
Markdown editor, Pixels/application migration and final HeroUI/theme removal
remain deferred.

Final `pnpm check` passed all six gates: 1,543 unit tests (one skipped), 472 browser
stories and seven packed consumers. The only existing snapshot changes in this
slice add the accessible drag-handle name.

## Breaking Uniform dependency removal (2026-10-15)

The user explicitly authorized deleting the three public legacy hooks after
confirming that consumers do not directly use `useUniformField` or
`useUniformFieldArray`; the only known `useInput` consumer is the external
Markdown editor. Their exports, compatibility wrappers and presentation getter
types are deleted. Internal field/array state is private and retains its existing
registration, transform, validation, array initialization and reset coverage.
The custom-control browser fixture now tests private state rather than a removed
public API. Nine tests of the deleted third-party `useInput` re-export are removed;
all Uniform-owned behavior tests are retained.

RadioBox's option contract now declares only owned supported props, eliminating
its HeroUI type dependency. All direct `@heroui/*`, `framer-motion` and
`@react-aria/visually-hidden` entries are removed from Uniform. Animation continues
through `pixel-motion`. Frozen-lockfile installation is verified. Packed-package
verification rejects direct HeroUI dependencies, runtime/declaration references,
and reintroduced legacy or private hook exports.

This is an intentional breaking API removal and must be released accordingly.
Versions/changelogs remain owned by Release Please. Migration guidance is in the
[Uniform migration guide](./uniform/migration.md). Pixels no longer brings HeroUI transitively. Its runtime, application consumers and final theme/plugin cleanup
are complete, as recorded in the final repository cleanup below. No external Markdown editor source was changed.

Final `pnpm check` passed all six gates: 1,534 unit tests (one skipped), 472 browser
stories and seven packed consumers. The unit-count change is exactly the nine
obsolete third-party re-export tests; field/array behavior coverage remains.
The packed Uniform independence guard passed against its actual tarball.

## Input composition refactor (2026-10-15)

Input is now split into a form-binding component and independent presentation.
`Input.tsx` owns field registration, transforms, debounced edits, reset/clear and
native-ref forwarding. Public props are declared in `Input.tsx` and remain
exported from the same module/entry point. The existing dedicated
`inputVariants.ts` remains the sole owner of the public and private recipes.

Private components live in `Input/subcomponents/`. `InputControl` owns visual state and styling composition, `InputField`
encapsulates the React Aria text/number engines and root selectors, `InputWrapper`
contains the shared editable layout/addons, and `InputClearButton` and `InputStepper` each own their control. They receive values, associations and callbacks without
registering fields or reading form context. Shared `FieldControlProps` and
`FieldIds` types keep control associations consistent between field state and
presentation. Prop declarations are documented, and binding/interaction blocks
are separated with whitespace and purpose comments. No new public entry points
are added.

All 24 existing Input tests pass without snapshot updates, as do all 18 existing
browser stories. Two added standalone tests verify that text editing, actual
input refs, clearing, controlled value updates and number-stepper context work
without a Uniform Form. This refactor intentionally changes no rendering, slots,
API, value formats, validation timing, reset or focus behavior.

Final `pnpm check` passed all six gates: 1,536 unit tests (one skipped), 472 browser
stories and seven packed consumers. Input snapshots, styling recipes, package
exports and peer/dependency ranges are unchanged.

### Shared radio composition

Radios and RadioBoxes now compose a private `RadioGroupField`, `FieldLayout` and
`RadioControl` instead of RadioLayout. The group engine accepts explicit values,
state and callbacks, routes form focus to an enabled option and shares supporting
message IDs. The layout uses React Aria Label to preserve radiogroup naming.
Group defaults and option styling have their own variant recipes, with option
hover styling driven by React Aria render state. Public entry points, numeric
value conversion, disabled behavior and existing styling slots are retained.

## Final repository cleanup

The final shared-theme migration removes all remaining direct HeroUI dependencies
and prunes the lockfile. Pixels also drops its unused direct Framer Motion edge;
Pixel Motion retains the animation dependency it uses. Atelier and Megapixels
keep their existing implementations and consume the migrated primitives.

The public `heroui` export is removed. Consumer migration uses the token CSS
import and built-package sources in the [styling guide](./styling.md#semantic-tokens).
No replacement JavaScript plugin is needed. Preserve historical sections above
as the implementation record; their pending notes describe the stage at the time.

Package verification now rejects HeroUI dependencies and runtime/declaration
references across every published package, and rejects the removed plugin export.
The known external Markdown editor remains outside the repository and must adopt
the previously documented breaking hook migration when upgrading.
