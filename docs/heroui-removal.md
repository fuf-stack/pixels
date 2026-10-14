# HeroUI removal: implementation inventory

Status: styling/token foundations and production Input/TextArea migrated; remaining components and final theme removal pending.
This is a staged breaking migration. It is not ready for a HeroUI-free release.
The only agreed breaking changes are consumer theme setup and removal of
`uniform/hooks/useInput`; other exported props, recipes, slots, and storage
contracts must remain compatible.

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

## Source inventory

The table records explicitly declared slots, not inherited HeroUI slots. The
linked source is authoritative for public props, defaults, variants and callbacks;
all component export paths in each package manifest must stay stable. A zero
story count means no same-directory story, not necessarily no consumer coverage.
This inventory does **not** certify DOM or visual compatibility. Those checks
must accompany each renderer migration, with before/after browser evidence.

| Component               | Props/source                                                                             | Recipe                   | Explicit slots                                                                                                                                                                                                                                                                                                                                                                                                                                 | Direct HeroUI modules      | Story files |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------- |
| pixels/Accordion        | [AccordionItemProps, AccordionProps](../packages/pixels/src/Accordion/Accordion.tsx)     | accordionVariants        | base, content, heading, indicator, startContent, subtitle, title, titleWrapper, trigger, wrapper                                                                                                                                                                                                                                                                                                                                               | divider, accordion         | 1           |
| pixels/Alert            | [AlertProps](../packages/pixels/src/Alert/Alert.tsx)                                     | alertVariants            | base, closeButton, description, endContent, icon, iconWrapper, mainWrapper, title                                                                                                                                                                                                                                                                                                                                                              | alert, theme               | 1           |
| pixels/Avatar           | [AvatarProps](../packages/pixels/src/Avatar/Avatar.tsx)                                  | avatarVariants           | base, fallback, icon, img, name                                                                                                                                                                                                                                                                                                                                                                                                                | avatar                     | 1           |
| pixels/AvatarGroup      | [AvatarGroupProps](../packages/pixels/src/AvatarGroup/AvatarGroup.tsx)                   | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | avatar                     | 1           |
| pixels/Badge            | [BadgeProps](../packages/pixels/src/Badge/Badge.tsx)                                     | badgeVariants            | badge, base                                                                                                                                                                                                                                                                                                                                                                                                                                    | badge                      | 1           |
| pixels/Breadcrumb       | [BreadcrumbItemProps, BreadcrumbProps](../packages/pixels/src/Breadcrumb/Breadcrumb.tsx) | breadcrumbVariants       | ellipsis, item, itemBase, list, separator, nav                                                                                                                                                                                                                                                                                                                                                                                                 | breadcrumbs                | 1           |
| pixels/Button           | [ButtonProps](../packages/pixels/src/Button/Button.tsx)                                  | buttonVariants           | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | button, theme              | 1           |
| pixels/ButtonGroup      | [inferred/re-exported](../packages/pixels/src/ButtonGroup/ButtonGroup.tsx)               | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | button                     | 1           |
| pixels/Card             | [CardProps](../packages/pixels/src/Card/Card.tsx)                                        | cardVariants             | base, body, divider, footer, header                                                                                                                                                                                                                                                                                                                                                                                                            | card, divider              | 1           |
| pixels/Drawer           | [DrawerProps](../packages/pixels/src/Drawer/Drawer.tsx)                                  | drawerVariants           | wrapper, base, backdrop, header, body, footer, closeButton                                                                                                                                                                                                                                                                                                                                                                                     | drawer                     | 1           |
| pixels/Label            | [LabelProps](../packages/pixels/src/Label/Label.tsx)                                     | labelVariants            | base, closeButton, content, dot, icon                                                                                                                                                                                                                                                                                                                                                                                                          | chip, theme                | 1           |
| pixels/Menu             | [MenuProps](../packages/pixels/src/Menu/Menu.tsx)                                        | menuVariants             | item, trigger                                                                                                                                                                                                                                                                                                                                                                                                                                  | button, dropdown           | 1           |
| pixels/Modal            | [ModalProps](../packages/pixels/src/Modal/Modal.tsx)                                     | modalVariants            | backdrop, base, body, closeButton, footer, header, wrapper                                                                                                                                                                                                                                                                                                                                                                                     | modal                      | 1           |
| pixels/Popover          | [PopoverProps](../packages/pixels/src/Popover/Popover.tsx)                               | popoverVariants          | body, content, divider, footer, footerWrapper, header, headerWrapper, trigger                                                                                                                                                                                                                                                                                                                                                                  | button, popover            | 1           |
| pixels/Progress         | [ProgressProps](../packages/pixels/src/Progress/Progress.tsx)                            | progressVariants         | base, indicator, label, labelWrapper, track, value                                                                                                                                                                                                                                                                                                                                                                                             | progress                   | 1           |
| pixels/ProgressCircular | [ProgressCircularProps](../packages/pixels/src/ProgressCircular/ProgressCircular.tsx)    | progressCircularVariants | base, indicator, label, svg, svgWrapper, track, value                                                                                                                                                                                                                                                                                                                                                                                          | progress, theme            | 1           |
| pixels/ScrollShadow     | [ScrollShadowProps](../packages/pixels/src/ScrollShadow/ScrollShadow.tsx)                | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | scroll-shadow              | 1           |
| pixels/SearchInput      | [SearchInputProps](../packages/pixels/src/SearchInput/SearchInput.tsx)                   | inputVariants            | base, clearButton, input, inputWrapper                                                                                                                                                                                                                                                                                                                                                                                                         | input                      | 1           |
| pixels/Table            | [TableColumnProps, TableRowProps, TableProps](../packages/pixels/src/Table/Table.tsx)    | tableVariants            | base, wrapper, table, thead, tbody, tr, th, td, tfoot, sortIcon, emptyWrapper, loadingWrapper                                                                                                                                                                                                                                                                                                                                                  | table                      | 1           |
| pixels/Tabs             | [TabProps, TabsProps](../packages/pixels/src/Tabs/Tabs.tsx)                              | tabsVariants             | base, cursor, panel, tab, tabContent, tabList, tabWrapper                                                                                                                                                                                                                                                                                                                                                                                      | tabs                       | 1           |
| pixels/Tooltip          | [TooltipProps](../packages/pixels/src/Tooltip/Tooltip.tsx)                               | tooltipVariants          | base, body, content, divider, footer, footerWrapper, header, headerWrapper, trigger                                                                                                                                                                                                                                                                                                                                                            | tooltip                    | 1           |
| uniform/Checkboxes      | [CheckboxesProps](../packages/uniform/src/Checkboxes/Checkboxes.tsx)                     | checkboxesVariants       | base, errorMessage, label, optionBase, optionIcon, optionLabel, optionLabelSubline, optionWrapper, wrapper                                                                                                                                                                                                                                                                                                                                     | checkbox, theme            | 1           |
| uniform/DatePicker      | [DatePickerProps](../packages/uniform/src/DatePicker/DatePicker.tsx)                     | datePickerVariants       | base, helperWrapper, calendar, calendarContent, inputWrapper, label, popoverContent, selectorButton, selectorIcon, timeInput, timeInputLabel                                                                                                                                                                                                                                                                                                   | date-picker                | 1           |
| uniform/FieldArray      | [inferred/re-exported](../packages/uniform/src/FieldArray/FieldArray.tsx)                | fieldArrayVariants       | base, actionsMenuButton, appendButton, elementFieldsGrid, label, list, listWrapper, listItem, listItemInner, removeButton, sortDragHandle                                                                                                                                                                                                                                                                                                      | via Pixels/useUniformField | 2           |
| uniform/FieldCard       | [FieldCardProps](../packages/uniform/src/FieldCard/FieldCard.tsx)                        | fieldCardVariants        | base, label, content, errorFooter, errorText                                                                                                                                                                                                                                                                                                                                                                                                   | via Pixels/useUniformField | 2           |
| uniform/Form            | [FormProps](../packages/uniform/src/Form/Form.tsx)                                       | formVariants             | base, debugViewer, debugViewerCopyButtonToggle, debugViewerHeader, debugViewerJson, debugViewerTriggerButton, form                                                                                                                                                                                                                                                                                                                             | via Pixels/useUniformField | 0           |
| uniform/Input           | [InputProps](../packages/uniform/src/Input/Input.tsx)                                    | inputVariants            | base, clearButton, input, inputWrapper                                                                                                                                                                                                                                                                                                                                                                                                         | —                          | 3           |
| uniform/RadioBoxes      | [RadioBoxesProps](../packages/uniform/src/RadioBoxes/RadioBoxes.tsx)                     | radioBoxesVariants       | base, boxBase, boxControl, boxDescription, boxLabel, boxLabelWrapper, label, wrapper                                                                                                                                                                                                                                                                                                                                                           | radio                      | 1           |
| uniform/RadioTabs       | [RadioTabsProps](../packages/uniform/src/RadioTabs/RadioTabs.tsx)                        | radioTabsVariants        | base, cursor, label, tab, tabBase, tabContent, tabList, tabPanel, tabWrapper, wrapper                                                                                                                                                                                                                                                                                                                                                          | radio                      | 1           |
| uniform/Radios          | [RadiosProps](../packages/uniform/src/Radios/Radios.tsx)                                 | radiosVariants           | base, errorMessage, itemBase, itemControl, itemDescription, itemLabel, itemLabelWrapper, itemWrapper, label, wrapper                                                                                                                                                                                                                                                                                                                           | radio                      | 1           |
| uniform/Select          | [SelectProps](../packages/uniform/src/Select/Select.tsx)                                 | selectVariants           | base, clearIndicator, control, control_focused, crossIcon, downChevron, dropdownIndicator, group, groupHeading, indicatorsContainer, indicatorSeparator, input, label, loadingIndicator, loadingMessage, menu, menuList, menuPortal, multiValue, multiValueContainer, multiValueLabel, multiValueRemove, noOptionsMessage, option, option_disabled, option_focused, option_selected, placeholder, selectContainer, singleValue, valueContainer | select                     | 2           |
| uniform/Slider          | [SliderProps](../packages/uniform/src/Slider/Slider.tsx)                                 | sliderVariants           | base, endContent, errorMessage, filler, label, labelWrapper, mark, startContent, step, thumb, track, trackWrapper, value                                                                                                                                                                                                                                                                                                                       | slider                     | 2           |
| uniform/SubmitButton    | [SubmitButtonProps](../packages/uniform/src/SubmitButton/SubmitButton.tsx)               | —                        | —                                                                                                                                                                                                                                                                                                                                                                                                                                              | via Pixels/useUniformField | 1           |
| uniform/Switch          | [SwitchProps](../packages/uniform/src/Switch/Switch.tsx)                                 | switchVariants           | base, endContent, errorMessage, label, outerWrapper, startContent, thumb, thumbIcon, wrapper                                                                                                                                                                                                                                                                                                                                                   | switch                     | 1           |
| uniform/SwitchBox       | [SwitchBoxProps](../packages/uniform/src/SwitchBox/SwitchBox.tsx)                        | switchBoxVariants        | box, description, icon, label, wrapper, thumb, thumbIcon                                                                                                                                                                                                                                                                                                                                                                                       | switch                     | 1           |
| uniform/TextArea        | [TextAreaProps](../packages/uniform/src/TextArea/TextArea.tsx)                           | textAreaVariants         | base, clearButton, input, inputWrapper                                                                                                                                                                                                                                                                                                                                                                                                         | —                          | 2           |
| uniform/Time            | [TimeProps](../packages/uniform/src/Time/Time.tsx)                                       | timeVariants             | base, helperWrapper, input, innerWrapper, inputWrapper, label, segment                                                                                                                                                                                                                                                                                                                                                                         | date-input                 | 1           |

Additional coupling:

- `pixel-utils/src/theme.ts`, its declaration bundling configuration, and
  `@repo/tailwind-config/{plugins,content}.ts` retain the HeroUI theme/plugin and
  source scanning. Neither can be removed until the owned tokens are packaged.
- Pixels Toast uses Sonner already; retain its behavior and test interoperability
  with replacement overlays. Existing Megapixels Base UI implementations stay.
- `RadioBoxes/RadioBox.tsx` and `SwitchBox.tsx` use HeroUI hooks and exported
  option/thumb contracts. `dateHelpers.ts` and `timeHelpers.ts` reference HeroUI
  types. Preserve structural typing and conversion semantics when removing them.
- Atelier and Megapixels consume Pixels primitives and semantic utilities, even
  where they have no direct HeroUI imports. Audit published declarations and
  packed consumers as well as source imports.

## Field composition audit and migration gates

`useUniformField` currently owns RHF registration, transformed values,
required-schema state, test IDs, the debug label button, error flattening, and
invalid visibility. Its invalid state uses the existing 200ms debounce hook;
keep this behavior and reduced-motion handling. It creates
`FieldValidationError`, then **calls the public HeroUI-backed `useInput` hook**
for label/error/helper prop getters. Replacing only the field renderer leaves
this hidden dependency in place. Preserve those public getters or document any
additional incompatible shape before changing them.

`FieldValidationError` renders the public error list and uses Pixel Motion for
entry/exit animations, with reduced-motion support. Reuse it locally in Uniform;
do not introduce another form-state owner or export public composition helpers.
It currently lacks an explicit DOM association ID. Establish stable control,
label, description, and error IDs once in the field hook, then pass them to the
actual editable element and React Aria contexts. Keep native validation from
competing with RHF/Veto.

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
source baseline. Representative field screenshots and computed-style baselines
are now captured in [field evidence](./migration-evidence/fields/README.md).
Complete per-slot mappings and checks for other renderers remain pending. No
production renderer other than Input and TextArea has been replaced yet.

The production React Aria text/number Input consumes a shared field-state core
without calling the legacy presentation hook. The public `useUniformField`
adapter retains its existing getters during coexistence. Production input tests cover
registration, resets, blur/submission flushing, pending-edit cancellation on
clear, focus restoration, decimal/zero/empty numbers, stepper updates, labels,
required markers, errors and consumer font-size merging. The form's existing
empty-field serialization remains unchanged. Local label and hint components
own presentation only and are not public entry points.

## Remaining sequence and release prerequisites

1. Capture representative light/dark Storybook visuals and complete per-component
   DOM/state/ref/callback mapping. Add packaged API compilation fixtures.
2. Owned tokens are packaged at `pixel-utils/tokens.css`, with CSS side effects
   and plugin-free Tailwind compilation/source detection checked against packed
   packages. Compare renderer visuals as each component adopts these tokens.
3. Text/number composition is now in production. Prototype grouped controls,
   DatePicker with time and Time against the field contracts above.
4. Migrate required Pixels primitives first, then field slices, using
   `useStyling().resolve` and configured `cn` throughout each slice. HeroUI
   wrappers currently do not honor the new provider.
5. Retain React Select; replace its HeroUI helper after shared field association
   exists. Audit remaining Pixels and application consumers, then remove unused
   HeroUI dependencies, plugin/scanning, theme export and inherited recipes.
6. Remove `uniform/hooks/useInput` only with migration documentation and verified
   external Markdown editor migration. That project's source and test environment
   were not supplied here: this remains a release prerequisite. The design note
   identifies CodeMirror integration but contains no complete consumer example.
7. Run the full check, packed declarations/export/dependency audit, visual and
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
