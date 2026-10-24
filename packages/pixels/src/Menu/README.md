# Menu

Dropdown of grouped actions with pointer and keyboard navigation.

```tsx
<Menu items={[{ key: 'edit', label: 'Edit', onClick: handleEdit }]}>
  Actions
</Menu>
```

- Omit children for an ellipsis trigger, use `triggerButtonProps` for a styled button
- `MenuSection` groups actions under a heading, it does not create a nested submenu
- Arrow keys, Home/End and typeahead navigate enabled options, Enter selects them
- `onAction` receives the key, each item's `onClick` retains its press event
- Escape and outside presses dismiss, focus returns to the trigger
- Placement names, Element portal containers and trigger/item slots remain supported

Additional surface, label, description and section slots are exposed through
`className` and the exported `menuVariants` recipe. Styling follows the active
styling provider, including inside the portal. Motion respects reduced motion.

[Props](./Menu.tsx) · [Stories](./stories/Menu.stories.tsx) · [React Aria Menu](https://react-aria.adobe.com/Menu)
