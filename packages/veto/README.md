# veto

Schema validation package for fuf projects.

## Install

```bash
pnpm add @fuf-stack/veto
```

## Quick Start

```ts
import v, { object, string } from '@fuf-stack/veto';

const schema = {
  user: object({
    name: string(),
  }),
};

const result = v(schema).validate({
  user: { name: 'Ada' },
});
```
