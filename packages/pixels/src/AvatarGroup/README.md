# AvatarGroup

Overlapping avatars with a compact indicator for hidden entries.

```tsx
<AvatarGroup
  max={3}
  avatars={[{ src: '/jane.png', fallback: 'JD' }, { src: '/alex.png' }]}
/>
```

`max` defaults to three. Set `max={0}` to show every entry. The trailing plus
announces the full hidden count, for example `+2`, to assistive technology.
Group size, radius and border apply to every avatar; group disabling combines
with each avatar's disabled appearance.

Use `avatarWrapper` and each entry's `wrapperProps` for links or buttons. Supply
an accessible name and native disabled behavior on those wrappers yourself.

## Compatibility

Supports React 18 and later. Package verification renders AvatarGroup with
React 18 from the published tarball, including visible entries and overflow.

## Styling

`className` styles the row. Each entry retains Avatar's slot overrides, see
[Avatar](../Avatar/README.md) and the [styling guide](../../../../docs/styling.md).
