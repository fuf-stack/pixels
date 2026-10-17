# Modal

Modal dialog for focused content and actions above the page.

```tsx
<Modal header="Edit details" isOpen={open} onClose={() => setOpen(false)}>
  {content}
</Modal>
```

- The owner controls `isOpen`, close button, Escape and backdrop presses request `onClose`
- Focus stays inside while open and returns to the previous control after closing
- The page is scroll locked, long content scrolls inside the body
- `header` labels the dialog, heading and body associations use unique IDs
- `portalContainer` accepts a DOM Element, `disableAnimation` and reduced motion skip feedback
- Existing sizes and backdrop/base/body/closeButton/footer/header/wrapper styling slots remain supported

For imperative dialogs, mount `ModalHost` once and call `modal.open({ header,
content })`. Its returned ID can be passed to `modal.close(id)`, and
`modal.closeAll()` closes the stack.

[Props](./Modal.tsx) · [Stories](./stories/Modal.stories.tsx) · [React Aria Dialog](https://react-aria.adobe.com/Dialog)
