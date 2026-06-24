# atelier

Customizable base app package for fuf projects.

## Install

```bash
pnpm add @fuf-stack/atelier
```

## Quick Start

```tsx
import { AtelierFrame } from '@fuf-stack/atelier';

export function App() {
  return (
    <AtelierFrame
      appName="fuf atelier"
      authState={{ status: 'anonymous', user: null }}
      navigation={[
        {
          id: 'main',
          label: 'Main',
          items: [{ id: 'dashboard', label: 'Dashboard', to: '/' }],
        },
      ]}
      resources={[{ id: 'dashboard', title: 'Dashboard' }]}
    />
  );
}
```

## Core Exports

- `createAtelierApp(config)` normalizes app config defaults.
- `createAuthAdapter(adapter)` provides a role-aware default access check.
- `filterNavigationForState(...)` returns only visible/accessible navigation items.
- `getResourceRenderer(...)` resolves resource renderer with safe fallbacks.
- `createAtelierRouteContext(...)` provides a lightweight TanStack Start route-context helper.
