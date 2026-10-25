# Visual coverage inventory

Every public component with a rendered surface has a representative story below.
Additional stories protect distinct variants, states and compositions according to
[the visual selection rule](./visual-regression.md#which-stories-get-visual-coverage).
Both light and dark themes run automatically. Update this inventory when changing
visual tags, keep capture settings in stories and baseline PNGs with their owner.

A component does not need a story named Default when a gallery or composition
already shows its normal appearance. These are selected states, not a requirement
to snapshot every possible prop combination.

The current set contains **120 stories / 240 theme comparisons**.

## Pixels

| Component                                                            | Captured stories                                                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [Accordion](../packages/pixels/src/Accordion/stories/)               | All Variants, Default Open                                                             |
| [Alert](../packages/pixels/src/Alert/stories/)                       | All Variants, Multiline Children                                                       |
| [Avatar](../packages/pixels/src/Avatar/stories/)                     | All Border Radii, Custom Styling                                                       |
| [AvatarGroup](../packages/pixels/src/AvatarGroup/stories/)           | Default, All Disabled                                                                  |
| [Badge](../packages/pixels/src/Badge/stories/)                       | All Colors, All Sizes                                                                  |
| [Breadcrumb](../packages/pixels/src/Breadcrumb/stories/)             | With Max Items, All Variants                                                           |
| [Button](../packages/pixels/src/Button/stories/)                     | Disabled, Icon Only, Loading, All Colors, All Sizes, All Variants, Keyboard Activation |
| [ButtonGroup](../packages/pixels/src/ButtonGroup/stories/)           | Default, Full Width                                                                    |
| [Card](../packages/pixels/src/Card/stories/)                         | Footer And Header                                                                      |
| [Drawer](../packages/pixels/src/Drawer/stories/)                     | Default Open                                                                           |
| [Json](../packages/pixels/src/Json/stories/)                         | With Json Object, Invalid Json                                                         |
| [Label](../packages/pixels/src/Label/stories/)                       | Icon And Content, All Colors, All Sizes                                                |
| [Menu](../packages/pixels/src/Menu/stories/)                         | Without Trigger                                                                        |
| [Modal](../packages/pixels/src/Modal/stories/)                       | With Header And Footer, Scroll Long Content, With Modal Host                           |
| [Popover](../packages/pixels/src/Popover/stories/)                   | All Sections                                                                           |
| [Progress](../packages/pixels/src/Progress/stories/)                 | Finished, All Colors, All Sizes                                                        |
| [ProgressCircular](../packages/pixels/src/ProgressCircular/stories/) | Finished, Has Error, All Sizes                                                         |
| [ScrollShadow](../packages/pixels/src/ScrollShadow/stories/)         | Vertical, Horizontal                                                                   |
| [SearchInput](../packages/pixels/src/SearchInput/stories/)           | Clearable, All Sizes                                                                   |
| [Table](../packages/pixels/src/Table/stories/)                       | Default, All Separators, Sticky Header                                                 |
| [Tabs](../packages/pixels/src/Tabs/stories/)                         | Default, Vertical Layout                                                               |
| [Toast](../packages/pixels/src/Toast/stories/)                       | Custom Width, Simple                                                                   |
| [Tooltip](../packages/pixels/src/Tooltip/stories/)                   | Default Open                                                                           |

## Uniform

| Component                                                                                         | Captured stories                                           |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Checkboxes](../packages/uniform/src/Checkboxes/stories/)                                         | With Initial Value, Disabled Option, Invalid               |
| [DatePicker](../packages/uniform/src/DatePicker/stories/)                                         | Disabled, Invalid, With Utc Time Zone, Open Calendar       |
| [FieldArray](../packages/uniform/src/FieldArray/stories/)                                         | With Initial Value, Invalid, All Features                  |
| [FieldCard](../packages/uniform/src/FieldCard/stories/)                                           | Default, Object Level Error                                |
| [Form](../packages/uniform/src/Form/stories/)                                                     | Default Layout                                             |
| [Grid](../packages/uniform/src/Grid/stories/)                                                     | Responsive Columns, Narrow Columns                         |
| [Input](../packages/uniform/src/Input/stories/)                                                   | With Label, Disabled, Invalid, Number, Password, All Sizes |
| [RadioBoxes](../packages/uniform/src/RadioBoxes/stories/)                                         | With Initial Value, Invalid, With Icons                    |
| [RadioTabs](../packages/uniform/src/RadioTabs/stories/)                                           | With Content, Disabled Option, All Variants                |
| [Radios](../packages/uniform/src/Radios/stories/)                                                 | With Initial Value, Disabled Option, Invalid               |
| [Select](../packages/uniform/src/Select/stories/)                                                 | Open Menu, Multi Select Initial Value, Invalid, Disabled   |
| [Slider](../packages/uniform/src/Slider/stories/)                                                 | Disabled, Invalid, With Steps                              |
| [SubmitButton](../packages/uniform/src/SubmitButton/stories/)                                     | Default, Icon Only                                         |
| [Switch](../packages/uniform/src/Switch/stories/)                                                 | With Initial Value, Disabled, All Sizes                    |
| [SwitchBox](../packages/uniform/src/SwitchBox/stories/)                                           | With Initial Value, Disabled, Invalid                      |
| [TextArea](../packages/uniform/src/TextArea/stories/)                                             | With Initial Value, Invalid, Disabled                      |
| [Time](../packages/uniform/src/Time/stories/)                                                     | Disabled, Invalid, With Utc Time Zone                      |
| [partials/FieldCopyTestIdButton](../packages/uniform/src/partials/FieldCopyTestIdButton/stories/) | Default                                                    |
| [partials/FieldValidationError](../packages/uniform/src/partials/FieldValidationError/stories/)   | Multiple Errors                                            |

## Megapixels

| Component                                                        | Captured stories                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [DataTable](../packages/megapixels/src/DataTable/stories/)       | Default, Expandable Rows, Row Selection, Loading, Empty After Filtering |
| [Filter](../packages/megapixels/src/Filter/stories/)             | With Search, With Initial Value                                         |
| [Notification](../packages/megapixels/src/Notification/stories/) | Simple                                                                  |
| [VirtualList](../packages/megapixels/src/VirtualList/stories/)   | Default, Dynamic Item Heights                                           |

## Atelier

| Component                                                     | Captured stories                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [AtelierFrame](../packages/atelier/src/AtelierFrame/stories/) | Default, Logged Out, Session Loading, Resource Empty, Resource Error, Mobile Layout |

## APIs without a separate surface

- `StylingProvider` adds no DOM or visual surface. Consumer styling is covered by
  custom Avatar styling and other component captures; its utility-merging
  contract remains covered by the provider's interaction and unit tests
- Hooks, field helpers, Atelier core configuration and types have no independent
  visual baseline. Test their behavior and types; capture their rendered consumers
- `toast` and `notification` are imperative APIs. Their Simple stories capture
  actual toast content through Toaster and NotificationHost. The Toaster Custom
  Width story also covers its host configuration
- `modal` and `ModalHost` share Modal's surface. With Modal Host captures the
  imperative path alongside Modal's normal and long-content captures
- `createWithSuspense` composes consumer content and fallbacks. Its existing
  stories test resolution and errors; it has no separately styled public surface
- Compound table elements and component subcomponents are covered through their
  owning component's compositions. Private field partials do not each need a
  separate baseline; the public FieldCopyTestIdButton and FieldValidationError do

No public visual component is intentionally left uncovered. A new public visual
component should add a representative story and baselines in the same change.
