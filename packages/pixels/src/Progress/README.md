# Progress

Progress bar showing how much of a task is complete.

```tsx
<Progress label="Uploading files" percent={42} showValueLabel />
```

- `percent` fills the track from zero to one hundred, the formatter receives the original value
- Completion uses the success color unless `disableFinishedState` is set
- `indeterminate` shows activity without announcing a numeric value
- `disableAnimation` and reduced-motion preferences stop activity animation
- `format` can return text or React content, rich content keeps a numeric accessible value

Style `base`, `indicator`, `label`, `labelWrapper`, `track` and `value` through
`className` or extend the exported `progressVariants` recipe.

[Props](./Progress.tsx) · [Stories](./stories/Progress.stories.tsx) · [Styling](../../../../docs/styling.md) · [React Aria ProgressBar](https://react-aria.adobe.com/ProgressBar)
