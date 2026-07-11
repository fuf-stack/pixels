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

## Deep Partial

Use `deepPartial(schema)` for schema-backed override configs where every
nested field should become optional while scalar validation still applies when
a value is provided.

```ts
import { deepPartial, object, string } from '@fuf-stack/veto';

const overrides = deepPartial(
  object({
    theme: object({
      color: string(),
    }),
  }),
);

overrides.parse({ theme: {} });
```

`deepPartial` supports objects, arrays, tuples, records, optional/nullable
wrappers, default/catch/readonly/lazy wrappers, unions, discriminated unions,
and intersections. For discriminated unions, the discriminator remains required
so the matching branch can still be selected.

Arrays stay arrays: object elements become partial, while scalar elements keep
their scalar type (`string[]` stays `string[]`, not `(string | undefined)[]`).
