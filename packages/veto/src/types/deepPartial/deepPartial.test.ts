import type { Output } from 'src';

import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  and,
  array,
  deepPartial,
  discriminatedUnion,
  literal,
  number,
  object,
  objectLoose,
  or,
  record,
  string,
} from 'src';
import { z } from 'zod';

const objectArray = () =>
  array(
    object({
      count: number().int(),
    }),
  );

describe('deepPartial', () => {
  it('allows omitting nested object keys recursively', () => {
    const schema = deepPartial(
      object({
        nested: object({
          name: string().min(1),
        }),
        requiredScalar: string().min(1),
      }),
    );

    const result = schema.parse({
      nested: {},
    });

    expect(result).toEqual({
      nested: {},
    });
  });

  it('allows omitting keys inside array object elements', () => {
    const schema = deepPartial(
      object({
        items: objectArray(),
      }),
    );

    const result = schema.parse({
      items: [{}],
    });

    expect(result).toEqual({
      items: [{}],
    });
  });

  it('supports top-level arrays of objects', () => {
    const schema = deepPartial(objectArray());

    const result = schema.parse([{}]);

    expect(result).toEqual([{}]);
  });

  it('keeps scalar array item types unchanged', () => {
    const schema = deepPartial(array(string()));
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = ['value'];

    expectTypeOf<SchemaType>().toEqualTypeOf<string[]>();
    expect(schema.parse(typedValue)).toEqual(['value']);
    expect(schema.safeParse([undefined]).success).toBe(false);
  });

  it('supports top-level tuples', () => {
    const schema = deepPartial(
      z.tuple([
        object({
          nested: object({
            name: string(),
          }),
        }),
        string(),
      ]),
    );
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = [{ nested: {} }, 'value'];

    expectTypeOf<SchemaType>().toEqualTypeOf<
      [
        {
          nested?: {
            name?: string;
          };
        },
        string,
      ]
    >();
    expect(schema.parse(typedValue)).toEqual([{ nested: {} }, 'value']);
  });

  it('supports top-level records with object values', () => {
    const schema = deepPartial(
      record(
        string(),
        object({
          nested: object({
            name: string(),
          }),
        }),
      ),
    );

    expect(schema.parse({ first: { nested: {} } })).toEqual({
      first: { nested: {} },
    });
  });

  it('supports nested records with object values', () => {
    const schema = deepPartial(
      object({
        byName: record(
          string(),
          object({
            nested: object({
              name: string(),
            }),
          }),
        ),
      }),
    );

    expect(schema.parse({ byName: { first: {} } })).toEqual({
      byName: { first: {} },
    });
  });

  it('deep-partials optional object wrappers', () => {
    const schema = deepPartial(
      object({
        nested: object({
          name: string(),
        }).optional(),
      }),
    );

    expect(schema.parse({ nested: {} })).toEqual({
      nested: {},
    });
  });

  it('deep-partials nullable object wrappers', () => {
    const schema = deepPartial(
      object({
        nested: object({
          name: string(),
        }).nullable(),
      }),
    );

    expect(schema.parse({ nested: {} })).toEqual({
      nested: {},
    });
    expect(schema.parse({ nested: null })).toEqual({
      nested: null,
    });
  });

  it('deep-partials default object wrappers', () => {
    const schema = deepPartial(
      object({
        nested: object({
          name: string(),
        }).default({ name: 'fallback' }),
      }),
    );

    expect(schema.parse({})).toEqual({
      nested: {
        name: 'fallback',
      },
    });
    expect(schema.parse({ nested: {} })).toEqual({
      nested: {},
    });
  });

  it('deep-partials catch object wrappers', () => {
    const schema = deepPartial(
      object({
        nested: object({
          name: string(),
        }).catch({ name: 'fallback' }),
      }),
    );

    expect(schema.parse({ nested: {} })).toEqual({
      nested: {},
    });
    expect(schema.parse({ nested: 'invalid' })).toEqual({
      nested: {
        name: 'fallback',
      },
    });
  });

  it('deep-partials readonly object wrappers', () => {
    const schema = deepPartial(
      object({
        nested: object({
          name: string(),
        }).readonly(),
      }),
    );
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = {
      nested: {},
    };

    expect(schema.parse(typedValue)).toEqual({
      nested: {},
    });
  });

  it('deep-partials lazy object wrappers', () => {
    const schema = deepPartial(
      z.lazy(() =>
        object({
          nested: object({
            name: string(),
          }),
        }),
      ),
    );
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = {
      nested: {},
    };

    expect(schema.parse(typedValue)).toEqual({
      nested: {},
    });
  });

  it('keeps scalar validation rules unchanged when a value is provided', () => {
    const schema = deepPartial(
      object({
        requiredScalar: string().min(1),
      }),
    );

    expect(() => {
      schema.parse({
        requiredScalar: 123,
      });
    }).toThrow();
  });

  it('preserves strict object unknown-key behavior', () => {
    const schema = deepPartial(
      object({
        nested: object({
          name: string(),
        }),
      }),
    );

    expect(schema.safeParse({ unexpected: true }).success).toBe(false);
  });

  it('deep-partials top-level union branches', () => {
    const schema = deepPartial(
      or(
        object({
          nested: object({
            name: string(),
          }),
        }),
        object({
          items: objectArray(),
        }),
      ),
    );

    expect(schema.parse({ nested: {} })).toEqual({ nested: {} });
    expect(schema.parse({ items: [{}] })).toEqual({ items: [{}] });
  });

  it('deep-partials nested union branches', () => {
    const schema = deepPartial(
      object({
        value: or(
          object({
            nested: object({
              name: string(),
            }),
          }),
          object({
            items: objectArray(),
          }),
        ),
      }),
    );

    expect(schema.parse({ value: { nested: {} } })).toEqual({
      value: { nested: {} },
    });
    expect(schema.parse({ value: { items: [{}] } })).toEqual({
      value: { items: [{}] },
    });
  });

  it('deep-partials discriminated union branches but keeps discriminator required', () => {
    const schema = deepPartial(
      discriminatedUnion('mode', [
        object({
          mode: literal('STRING'),
          nested: object({
            name: string(),
          }),
        }),
        object({
          count: number(),
          mode: literal('NUMBER'),
        }),
      ]),
    );

    expect(schema.parse({ mode: 'STRING', nested: {} })).toEqual({
      mode: 'STRING',
      nested: {},
    });
    expect(schema.parse({ mode: 'NUMBER' })).toEqual({ mode: 'NUMBER' });
    expect(schema.safeParse({}).success).toBe(false);
  });

  it('deep-partials discriminated union array and record branch fields', () => {
    const schema = deepPartial(
      discriminatedUnion('mode', [
        object({
          items: objectArray(),
          mode: literal('ARRAY'),
        }),
        object({
          byName: record(
            string(),
            object({
              nested: object({
                name: string(),
              }),
            }),
          ),
          mode: literal('RECORD'),
        }),
      ]),
    );

    expect(schema.parse({ items: [{}], mode: 'ARRAY' })).toEqual({
      items: [{}],
      mode: 'ARRAY',
    });
    expect(schema.parse({ byName: { first: {} }, mode: 'RECORD' })).toEqual({
      byName: { first: {} },
      mode: 'RECORD',
    });
  });

  it('deep-partials intersection operands', () => {
    const schema = deepPartial(
      and(
        objectLoose({
          base: object({
            name: string(),
          }),
        }),
        objectLoose({
          extra: object({
            count: number(),
          }),
        }),
      ),
    );

    expect(schema.parse({ base: {}, extra: {} })).toEqual({
      base: {},
      extra: {},
    });
  });

  it('deep-partials top-level intersections', () => {
    const schema = deepPartial(
      and(
        objectLoose({
          base: object({
            name: string(),
          }),
        }),
        objectLoose({
          values: record(
            string(),
            object({
              count: number(),
            }),
          ),
        }),
      ),
    );

    expect(schema.parse({ base: {}, values: { first: {} } })).toEqual({
      base: {},
      values: { first: {} },
    });
  });

  it('infers nested object and array item properties as optional', () => {
    const schema = deepPartial(
      object({
        items: objectArray(),
        nested: object({
          name: string(),
        }),
        records: record(
          string(),
          object({
            enabled: literal(true),
          }),
        ),
        requiredScalar: string(),
      }),
    );
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = {
      items: [{}],
      nested: {},
    };

    const typedRecordValue: SchemaType = {
      records: {
        first: {},
      },
    };
    expectTypeOf<SchemaType['items']>().toEqualTypeOf<
      | {
          count?: number;
        }[]
      | undefined
    >();
    expectTypeOf<SchemaType['nested']>().toEqualTypeOf<
      | {
          name?: string;
        }
      | undefined
    >();
    expectTypeOf<SchemaType['requiredScalar']>().toEqualTypeOf<
      string | undefined
    >();
    expect(schema.parse(typedValue)).toEqual({
      items: [{}],
      nested: {},
    });
    expect(schema.parse(typedRecordValue)).toEqual({
      records: {
        first: {},
      },
    });
  });

  it('preserves top-level array output types', () => {
    const schema = deepPartial(objectArray());
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = [{}];

    expectTypeOf<SchemaType>().toEqualTypeOf<
      {
        count?: number;
      }[]
    >();
    expect(schema.parse(typedValue)).toEqual([{}]);
  });

  it('preserves top-level record output types', () => {
    const schema = deepPartial(
      record(
        string(),
        object({
          nested: object({
            name: string(),
          }),
        }),
      ),
    );
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = {
      first: {
        nested: {},
      },
      second: {},
    };

    expect(schema.parse(typedValue)).toEqual({
      first: {
        nested: {},
      },
      second: {},
    });
  });

  it('preserves union output types', () => {
    const schema = deepPartial(
      or(
        object({
          nested: object({
            name: string(),
          }),
        }),
        object({
          items: objectArray(),
        }),
      ),
    );
    type SchemaType = Output<typeof schema>;

    const typedNestedValue: SchemaType = {
      nested: {},
    };
    const typedItemsValue: SchemaType = {
      items: [{}],
    };

    expectTypeOf<SchemaType>().toEqualTypeOf<
      | {
          nested?: {
            name?: string;
          };
        }
      | {
          items?: {
            count?: number;
          }[];
        }
    >();
    expect(schema.parse(typedNestedValue)).toEqual({ nested: {} });
    expect(schema.parse(typedItemsValue)).toEqual({ items: [{}] });
  });

  it('preserves discriminated union output types', () => {
    const schema = deepPartial(
      discriminatedUnion('mode', [
        object({
          mode: literal('STRING'),
          nested: object({
            name: string(),
          }),
        }),
        object({
          count: number(),
          mode: literal('NUMBER'),
        }),
      ]),
    );
    type SchemaType = Output<typeof schema>;

    const typedStringValue: SchemaType = {
      mode: 'STRING',
      nested: {},
    };
    const typedNumberValue: SchemaType = {
      mode: 'NUMBER',
    };
    // @ts-expect-error The discriminator must remain present for branch selection.
    const typedMissingDiscriminatorValue: SchemaType = {};

    expect(schema.parse(typedStringValue)).toEqual({
      mode: 'STRING',
      nested: {},
    });
    expect(schema.parse(typedNumberValue)).toEqual({
      mode: 'NUMBER',
    });
    expect(typedMissingDiscriminatorValue).toEqual({});
  });

  it('preserves optional and nullable wrapper output types', () => {
    const schema = deepPartial(
      object({
        nullableNested: object({
          name: string(),
        }).nullable(),
        optionalNested: object({
          name: string(),
        }).optional(),
      }),
    );
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = {
      nullableNested: null,
      optionalNested: {},
    };

    expectTypeOf<SchemaType['nullableNested']>().toEqualTypeOf<
      | {
          name?: string;
        }
      | null
      | undefined
    >();
    expectTypeOf<SchemaType['optionalNested']>().toEqualTypeOf<
      | {
          name?: string;
        }
      | undefined
    >();
    expect(schema.parse(typedValue)).toEqual({
      nullableNested: null,
      optionalNested: {},
    });
  });

  it('preserves intersection output types', () => {
    const schema = deepPartial(
      and(
        objectLoose({
          base: object({
            name: string(),
          }),
        }),
        objectLoose({
          extra: object({
            count: number(),
          }),
        }),
      ),
    );
    type SchemaType = Output<typeof schema>;

    const typedValue: SchemaType = {
      base: {},
      extra: {},
    };

    expectTypeOf(typedValue).toMatchTypeOf<
      {
        base?: {
          name?: string;
        };
      } & {
        extra?: {
          count?: number;
        };
      }
    >();
    expect(schema.parse(typedValue)).toEqual({
      base: {},
      extra: {},
    });
  });
});
