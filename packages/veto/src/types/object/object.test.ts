/* eslint-disable vitest/expect-expect */

import type { VObjectSchema } from './object';

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { number, object, string } from 'src';

const schema = {
  objectField: object({ key: string() }),
};

const validInput = { objectField: { key: 'some string' } };

describe('object', () => {
  describe('typing', () => {
    it('exposes object schema typing', () => {
      const objectSchema = object({ key: string() });

      expectTypeOf(objectSchema).toEqualTypeOf<
        VObjectSchema<{ key: ReturnType<typeof string> }>
      >();
      expectTypeOf(objectSchema.parse({ key: 'value' })).toEqualTypeOf<{
        key: string;
      }>();
    });
  });

  describe('validation', () => {
    it('accepts valid object value', () => {
      const result = veto(schema).validate(validInput);
      expect(result).toStrictEqual({
        success: true,
        data: validInput,
        errors: null,
      });
    });

    it('rejects unknown keys on strict objects', () => {
      const objectSchema = object({ key: string() });
      const result = objectSchema.safeParse({
        key: 'some string',
        unknownField: 'unexpected',
      });

      expect(result.success).toBe(false);
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          code: 'unrecognized_keys',
          keys: ['unknownField'],
        }),
      );
    });

    it('rejects missing fields', () => {
      const result = veto(schema).validate({
        objectField: {},
      });
      expect(result).toStrictEqual({
        success: false,
        data: null,
        errors: {
          objectField: {
            key: [
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Field is required',
                received: 'undefined',
              },
            ],
          },
        },
      });
    });

    it('rejects unknown fields', () => {
      const result = veto(schema).validate({
        objectField: {
          key: 'some string',
          otherField: 'some other string',
        },
      });
      expect(result).toStrictEqual({
        success: false,
        data: null,
        errors: {
          objectField: {
            _errors: [
              {
                code: 'unrecognized_keys',
                keys: ['otherField'],
                message: "Unrecognized key(s) in object: 'otherField'",
              },
            ],
          },
        },
      });
    });

    it('keeps unknown-key and missing-field errors on the same object', () => {
      const result = veto(schema).validate({
        objectField: {
          otherField: 'some other string',
        },
      });
      expect(result).toStrictEqual({
        success: false,
        data: null,
        errors: {
          objectField: {
            _errors: [
              {
                code: 'unrecognized_keys',
                keys: ['otherField'],
                message: "Unrecognized key(s) in object: 'otherField'",
              },
            ],
            key: [
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Field is required',
                received: 'undefined',
              },
            ],
          },
        },
      });
    });

    it('rejects non-object value', () => {
      const result = veto(schema).validate({
        objectField: ['some string'],
      });
      expect(result).toStrictEqual({
        success: false,
        data: null,
        errors: {
          objectField: {
            _errors: [
              {
                code: 'invalid_type',
                expected: 'object',
                message: 'Expected object, received array',
                received: 'array',
              },
            ],
          },
        },
      });
    });
  });

  describe('object extension', () => {
    it('supports object.extend() for adding fields', () => {
      const baseSchema = object({ key: string() });
      const extendedSchema = baseSchema.extend({ count: number() });
      const result = veto({ objectField: extendedSchema }).validate({
        objectField: {
          key: 'some string',
          count: 1,
        },
      });

      expect(result).toStrictEqual({
        success: true,
        data: {
          objectField: {
            key: 'some string',
            count: 1,
          },
        },
        errors: null,
      });
    });

    it('supports object.extend() overwrite semantics', () => {
      const baseSchema = object({ key: string() });
      const overwrittenSchema = baseSchema.extend({ key: number() });
      const result = veto({ objectField: overwrittenSchema }).validate({
        objectField: {
          key: 'some string',
        },
      });

      expect(result).toMatchObject({
        success: false,
        data: null,
        errors: {
          objectField: {
            key: [
              {
                code: 'invalid_type',
                expected: 'number',
                received: 'string',
              },
            ],
          },
        },
      });
    });

    it('supports object.safeExtend() on refined schemas', () => {
      const baseSchema = object({ key: string(), confirm: string() }).refine(
        (data) => data.key === data.confirm,
        {
          message: 'Values must match',
        },
      );
      const safeExtendedSchema = baseSchema.safeExtend({
        key: string().min(5),
        count: number(),
      });
      const result = veto({ objectField: safeExtendedSchema }).validate({
        objectField: {
          key: 'abcd',
          confirm: 'xyz',
          count: 1,
        },
      });

      expect(result).toMatchObject({
        success: false,
        data: null,
        errors: {
          objectField: {
            _errors: [
              {
                code: 'custom',
                message: 'Values must match',
              },
            ],
            key: [
              {
                code: 'too_small',
              },
            ],
          },
        },
      });
    });

    it('supports shape spread for adding fields', () => {
      const baseSchema = object({ key: string() });
      const spreadSchema = object({
        ...baseSchema.shape,
        count: number(),
      });
      const result = veto({ objectField: spreadSchema }).validate({
        objectField: {
          key: 'some string',
          count: 1,
        },
      });

      expect(result).toStrictEqual({
        success: true,
        data: {
          objectField: {
            key: 'some string',
            count: 1,
          },
        },
        errors: null,
      });
    });

    it('supports shape spread overwrite semantics', () => {
      const baseSchema = object({ key: string() });
      const spreadSchema = object({
        ...baseSchema.shape,
        key: number(),
      });
      const result = veto({ objectField: spreadSchema }).validate({
        objectField: {
          key: 'some string',
        },
      });

      expect(result).toMatchObject({
        success: false,
        data: null,
        errors: {
          objectField: {
            key: [
              {
                code: 'invalid_type',
                expected: 'number',
                received: 'string',
              },
            ],
          },
        },
      });
    });
  });
});
