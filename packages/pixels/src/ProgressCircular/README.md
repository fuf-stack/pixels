# ProgressCircular

Progress ring showing completion or an error for a task.

```tsx
<ProgressCircular ariaLabel="Upload progress" percent={42} size="md" />
```

- The ring clamps `percent` to zero through one hundred, `format` receives the original value
- Completion shows a check mark, `hasError` takes precedence and shows a cross
- `disableFinishedState` keeps the formatted value and configured color on completion
- Missing progress renders zero rather than an indeterminate spinner
- `strokeWidth` uses SVG viewBox units, defaults adjust with `size`
- Initial rendering, `disableAnimation` and reduced motion avoid animated transitions

Style the ring and value through `className`. Existing slots remain available,
with `statusIcon` additionally exposing the completion/error symbol. The exported
`progressCircularVariants` recipe uses the consumer's styling instance.

[Props](./ProgressCircular.tsx) · [Stories](./stories/ProgressCircular.stories.tsx) · [Styling](../../../../docs/styling.md) · [React Aria ProgressBar](https://react-aria.adobe.com/ProgressBar)
