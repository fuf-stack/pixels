# SearchInput

Search text input with a leading icon and clear action.

```tsx
import SearchInput from '@fuf-stack/pixels/SearchInput';

<SearchInput placeholder="Find projects" onChange={setSearch} />;
```

- `initialValue` is read on mount, subsequent edits are managed locally
- Ordinary edits report strings, including `''`, explicit clearing reports `null`
- The clear action and Escape restore input focus, Escape continues to bubble
- The placeholder supplies the accessible name, otherwise it defaults to `Search`
- Existing slots remain available, with `innerWrapper` and `mainWrapper` for layout
- `endContent` remains accepted, the clear action replaces it as before

[Props](./SearchInput.tsx) · [Stories](./stories/SearchInput.stories.tsx) ·
[React Aria TextField](https://react-aria.adobe.com/TextField)
