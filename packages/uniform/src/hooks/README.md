# Uniform hooks

These hooks connect form components to React Hook Form and Uniform's validation,
value conversion, and change notifications. Most need a parent Uniform `Form`.

| Hook                                                                       | Purpose                                                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [useUniformField](useUniformField/useUniformField.tsx)                     | Combines registration, labels, validation feedback, test IDs, and value transforms for field components |
| [useUniformFieldArray](useUniformFieldArray/useUniformFieldArray.ts)       | Adds flat-array support, initialization, reset handling, and animation state to RHF field arrays        |
| [useController](useController/useController.ts)                            | Wraps RHF's controller with nullish-value conversion and user-change notifications                      |
| [useFormContext](useFormContext/useFormContext.ts)                         | Provides RHF methods with schema-aware field state, value conversion, and reset notifications           |
| [useClientValidation](useClientValidation/useClientValidation.ts)          | Registers dynamic client validation alongside the form's base schema                                    |
| [useInput](useInput/useInput.ts)                                           | Re-exports HeroUI's input hook                                                                          |
| [useInputValueDebounce](useInputValueDebounce/useInputValueDebounce.ts)    | Updates displayed input immediately, debounces stored changes, and flushes on blur                      |
| [useInputValueTransform](useInputValueTransform/useInputValueTransform.ts) | Converts between display values and stored form values                                                  |
| [useWatchFormReset](useWatchFormReset/useWatchFormReset.ts)                | Runs a callback for resets made through Uniform's form context                                          |
| [useWatchUserChange](useWatchUserChange/useWatchUserChange.ts)             | Reacts to user edits without firing for programmatic value changes or resets                            |

For custom fields, start with `useUniformField`. For ordinary form access, use
`useFormContext`. Form initialization uses React Hook Form's `useForm` internally;
Uniform does not add a separate hook with that name.

See also [Uniform compared with React Hook Form](../../../../docs/uniform-vs-rhf.md).
