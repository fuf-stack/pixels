# SwitchBox

A card-style boolean toggle with a label and description.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import SwitchBox from '@fuf-stack/uniform/SwitchBox';

<Form initialValues={{ notifications: false }} onSubmit={console.log}>
  <SwitchBox
    label="Email notifications"
    description="Receive updates about your projects"
    name="notifications"
  />
</Form>;
```

## Notes

- Stores a boolean value and supports toggling through the card.
- Use `icon` for a leading visual and `thumbIcon` for content inside the switch thumb.

Validation messages can be styled through the `errorMessage` and `helperWrapper`
slots in `className`.

[Props](SwitchBox.tsx) · [Stories](stories/SwitchBox.stories.tsx)

## Composition

`SwitchBox` owns form registration and boolean values. `SwitchBoxControl` owns
the native input ref, React Aria interactions, styling and message placement.
Recipes and their derived types live in `switchBoxVariants.ts`.

`SwitchBoxTrack` owns the visual track and selection-aware thumb icon, preserving its
placement before or after the label according to the optional icon.
