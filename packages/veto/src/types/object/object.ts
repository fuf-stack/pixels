import type { ZodObject, ZodRawShape, ZodTypeAny } from 'src/zodResolved';

import { z } from 'src/zodResolved';

export type VObject<T extends ZodRawShape> = ZodObject<T, 'strict', ZodTypeAny>;

export default <T extends ZodRawShape>(schema: T) =>
  z
    // see: https://zod.dev/?id=objects
    .object(schema)
    // expect objects to be strict (disallow unknown keys)
    .strict();
