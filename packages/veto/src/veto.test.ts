import { describe, expect, it } from 'vitest';

import v, {
  and,
  any,
  array,
  boolean,
  number,
  object,
  string,
  vEnum,
} from 'src';

describe('validate', () => {
  it('schema can be an object', () => {
    const schema = { stringField: string() };
    const input = { stringField: 'a string' };
    const result = v(schema).validate(input);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data', input);
  });

  it('schema can be a zod object type', () => {
    const schema = object({ stringField: string() });
    const input = { stringField: 'a string' };
    const result = v(schema).validate(input);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data', input);
  });

  it('schema can be and extended zod object', () => {
    const base = object({ stringField: string() });
    const schema = base.extend({ numberField: number() });
    const input = { stringField: 'a string', numberField: 123 };
    const result = v(schema).validate(input);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data', input);
  });

  it('unknown properties are rejected', () => {
    const schema = {
      stringField: string(),
    };
    const input = {
      stringField: 'a string',
      unknownField: 'a string',
    };
    const result = v(schema).validate(input);
    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('data', null);
    expect(result).toHaveProperty('errors');
    expect(result.errors).toMatchObject({
      _errors: [
        {
          code: 'unrecognized_keys',
          keys: ['unknownField'],
        },
      ],
    });
  });

  it('validates a complex input', () => {
    const schema = {
      array: array(string()),
      booleanField: boolean(),
      numberField: number(),
      stringField: string(),
      vEnum: vEnum(['one', 'two']),
    };
    const input = {
      array: ['element one', 'element two'],
      booleanField: true,
      numberField: 1,
      stringField: 'a string',
      vEnum: 'two',
    };
    const result = v(schema).validate(input);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('errors', null);
    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject(input);
  });

  it('uses defaults when provided', () => {
    const schema = {
      stringField: string(),
      fieldWithDefault: string(),
    };
    const input = {
      stringField: 'a string',
    };
    const defaults = {
      fieldWithDefault: 'a default value',
    };
    const result = v(schema, { defaults }).validate(input);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('errors', null);
    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject({
      stringField: 'a string',
      fieldWithDefault: 'a default value',
    });
  });
});

describe('validateAsync', () => {
  it('validates merged sync and async schema', async () => {
    const schema = {
      stringField: string(),
    };
    const schemaAsync = {
      stringField: any().refine(async (value) => value.length >= 5),
    };
    const input = {
      stringField: 'a string',
    };
    const result = await v(
      and(object(schema), object(schemaAsync)),
    ).validateAsync(input);

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('errors', null);
    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject(input);
  });

  it('validates merged unequal sync and async schema with passthrough', async () => {
    const schema = object({
      stringField: string(),
      numberField: number(),
    });
    const schemaAsync = object({
      stringField: any().refine(async (value) => value.length >= 5),
    }).passthrough();
    const input = {
      stringField: 'a string',
      numberField: 42,
    };
    const result = await v(and(schema, schemaAsync)).validateAsync(input);

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('errors', null);
    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject(input);
  });

  it('rejects if async validation fails', async () => {
    const schema = {
      stringField: string(),
    };
    const schemaAsync = {
      stringField: any().refine(async (value) => value.length <= 5, {
        message: 'Input to long',
      }),
    };
    const input = {
      stringField: 'a string',
    };
    const result = await v(
      and(object(schema), object(schemaAsync)),
    ).validateAsync(input);

    expect(result).toHaveProperty('success', false);
    expect(result.errors).toMatchObject({
      stringField: [
        {
          code: 'custom',
          message: 'Input to long',
        },
      ],
    });
  });

  it('also reject sync validation fails', async () => {
    const schema = {
      stringField: string(),
    };
    const schemaAsync = {
      stringField: any().refine(async (value) => value.length <= 5, {
        message: 'Input to long',
      }),
    };
    const input = {
      stringField: 42,
    };
    const result = await v(
      and(object(schema), object(schemaAsync)),
    ).validateAsync(input);

    expect(result).toHaveProperty('success', false);
    expect(result.errors).toMatchObject({
      stringField: [
        {
          code: 'invalid_type',
          expected: 'string',
        },
        {
          code: 'custom',
          message: 'Input to long',
        },
      ],
    });
  });
});
