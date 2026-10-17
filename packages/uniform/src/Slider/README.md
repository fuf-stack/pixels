# Slider

A slider for choosing a single numeric value.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Slider from '@fuf-stack/uniform/Slider';

<Form initialValues={{ volume: 50 }} onSubmit={console.log}>
  <Slider label="Volume" name="volume" minValue={0} maxValue={100} step={5} />
</Form>;
```

## Notes

- Stores one number; minimum, maximum and step describe the displayed range.
- `transform` converts between stored and displayed values when their units differ.

[Props](Slider.tsx) · [Stories](stories/Slider.stories.tsx)

## Composition

`Slider` registers the field, configures transforms and supplies a current-value
accessor. `SliderControl` owns range presentation, focus routing and empty-value
commits at interaction completion. `SliderTrackControl` owns the track wrapper, surrounding
content, fill geometry, step markers and native range input.
