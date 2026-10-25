# Notification

Toast notifications with optional actions and related modal content.

```tsx
<NotificationHost />;

notification.success('Your changes are ready', { title: 'Saved' });
```

Mount `NotificationHost` once. It composes the Pixels Toaster and ModalHost
without adding a DOM wrapper. Its width and stacking styles stay inline because
they override Sonner's runtime styles. It does not need a control subcomponent
or an additional variants recipe.

Normal stories cover variants and actions, edge-case stories verify notification
and modal stacking in both directions.

[API](./notification.tsx) · [Stories](./stories/notification.stories.tsx)
