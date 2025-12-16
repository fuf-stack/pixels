// import veto
import { veto } from './veto';

// import error map for side effect (sets custom zod error messages)
import './errorMap';

// Re-export all TYPES from zod (ParseContext, RefinementCtx, ZodString, etc.)
// so downstream consumers can access them without needing zod as a direct dependency.
// Using `export type *` ensures we only export types, not runtime values,
// which would otherwise overwrite veto's customized functions (string, object, etc.).
export type * from 'zod';

// export veto ts types
export type * from './types';
export type * from './vInfer';

// export veto issue codes
export * from './issueCodes';

// export serializeSchema helper and types
export { serializeSchema, checkSerializedSchemaPath } from './serialize';
export type {
  JSONSchema,
  CheckSerializedSchemaPathCheckFunction,
} from './serialize';

// export veto validator types
export * from './types/and/and';
export * from './types/any/any';
export * from './types/array/array';
export * from './types/boolean/boolean';
export * from './types/discriminatedUnion/discriminatedUnion';
export * from './types/json/json';
export * from './types/literal/literal';
export * from './types/nativeEnum/nativeEnum';
export * from './types/number/number';
export * from './types/object/object';
export * from './types/record/record';
export * from './types/string/string';
export * from './types/vEnum/vEnum';

// export veto
export * from './veto';

// also export veto as default
export default veto;
