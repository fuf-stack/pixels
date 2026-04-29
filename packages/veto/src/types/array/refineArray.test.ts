/* eslint-disable vitest/expect-expect */

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { array, number, object, refineArray, string } from 'src';

describe('custom refinement', () => {
  it('preserves refined array schema typing', () => {
    const refined = refineArray(array(string()))({
      custom: () => {},
    });

    expectTypeOf(refined.parse(['one', 'two'])).toEqualTypeOf<string[]>();
  });

  it('supports refining optional arrays', () => {
    const refined = refineArray(array(string()).optional())({
      custom: () => {},
    });

    expect(refined.safeParse(undefined).success).toBe(true);
  });

  it('validates array with custom logic', () => {
    const schema = {
      arrayField: refineArray(array(string()))({
        custom: (val, ctx) => {
          if (Array.isArray(val) && val.length < 2) {
            ctx.addIssue({
              code: 'too_small',
              inclusive: true,
              message: 'Array must have at least 2 elements',
              minimum: 2,
              origin: 'array',
            });
          }
        },
      }),
    };
    const result = veto(schema).validate({
      arrayField: ['one'],
    });
    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          _errors: [
            {
              code: 'too_small',
              exact: false,
              inclusive: true,
              message: 'Array must have at least 2 elements',
              minimum: 2,
              type: 'array',
            },
          ],
        },
      },
    });
  });

  it('can validate array elements', () => {
    const schema = {
      arrayField: refineArray(array(object({ value: number() })))({
        custom: (val, ctx) => {
          if (Array.isArray(val)) {
            val.forEach((item, index) => {
              // @ts-expect-error this is ok
              if (item?.value < 0) {
                ctx.addIssue({
                  code: 'custom',
                  message: 'Value must be positive',
                  path: [index, 'value'],
                });
              }
            });
          }
        },
      }),
    };
    const result = veto(schema).validate({
      arrayField: [{ value: 1 }, { value: -2 }, { value: 3 }],
    });
    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          '1': {
            value: [
              {
                code: 'custom',
                message: 'Value must be positive',
              },
            ],
          },
        },
      },
    });
  });

  it('works with optional arrays', () => {
    const schema = {
      arrayField: refineArray(array(string()).optional())({
        custom: (val, ctx) => {
          if (Array.isArray(val) && val.length > 3) {
            ctx.addIssue({
              code: 'too_big',
              inclusive: true,
              maximum: 3,
              message: 'Array must have at most 3 elements',
              origin: 'array',
            });
          }
        },
      }),
    };

    const resultWithEmptyObject = veto(schema).validate({});
    expect(resultWithEmptyObject).toStrictEqual({
      success: true,
      data: {},
      errors: null,
    });

    const resultWithLongArray = veto(schema).validate({
      arrayField: ['one', 'two', 'three', 'four'],
    });
    expect(resultWithLongArray).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          _errors: [
            {
              code: 'too_big',
              exact: false,
              inclusive: true,
              maximum: 3,
              message: 'Array must have at most 3 elements',
              type: 'array',
            },
          ],
        },
      },
    });
  });
});

describe('unique refinement', () => {
  it('checks if elements are unique', () => {
    const schema = {
      arrayField: refineArray(array(string()))({
        unique: true,
      }),
    };
    const result = veto(schema).validate({
      arrayField: ['one', 'two', 'three', 'one'],
    });
    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          '3': [
            {
              code: 'not_unique',
              message: 'Element already exists',
            },
          ],
          _errors: [
            {
              code: 'not_unique',
              message: 'Array elements are not unique',
              type: 'array',
            },
          ],
        },
      },
    });
  });

  it('unique + mapFn checks if elements are unique on objects', () => {
    const schema = {
      arrayField: refineArray(array(object({ name: string(), id: number() })))({
        unique: {
          mapFn: (val) => {
            if (
              typeof val === 'object' &&
              val !== null &&
              'id' in val &&
              typeof val.id === 'number'
            ) {
              return val.id;
            }
            return undefined;
          },
        },
      }),
    };
    const result = veto(schema).validate({
      arrayField: [
        { name: 'one', id: 1 },
        { name: 'two', id: 2 },
        { name: 'three', id: 3 },
        { name: 'four', id: 1 },
      ],
    });

    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          '3': {
            _errors: [
              {
                code: 'not_unique',
                message: 'Element already exists',
              },
            ],
          },
          _errors: [
            {
              code: 'not_unique',
              message: 'Array elements are not unique',
              type: 'array',
            },
          ],
        },
      },
    });
  });

  it('unique + mapFn checks if elements are unique on deeply nested objects', () => {
    const schema = {
      arrayField: refineArray(
        array(
          object({
            name: string(),
            data: object({
              fieldA: string().optional(),
              fieldB: string(),
            }).optional(),
          }),
        ),
      )({
        unique: {
          mapFn: (val) => {
            if (
              typeof val === 'object' &&
              val !== null &&
              'data' in val &&
              typeof val.data === 'object' &&
              val.data !== null &&
              'fieldB' in val.data &&
              typeof val.data.fieldB === 'string'
            ) {
              return val.data.fieldB;
            }
            return undefined;
          },
        },
      }),
    };
    const result = veto(schema).validate({
      arrayField: [
        { name: 'one', data: { fieldA: 'test', fieldB: 'not-unique' } },
        { name: 'two', data: { fieldB: 'not-unique' } },
        { name: 'three' },
      ],
    });

    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          '1': {
            _errors: [
              {
                code: 'not_unique',
                message: 'Element already exists',
              },
            ],
          },
          _errors: [
            {
              code: 'not_unique',
              message: 'Array elements are not unique',
              type: 'array',
            },
          ],
        },
      },
    });
  });

  it('unique + mapFn + elementErrorPath allows adding error to subfield', () => {
    const schema = {
      arrayField: refineArray(
        array(
          object({
            name: string(),
            data: object({
              fieldA: string().optional(),
              fieldB: string(),
            }).optional(),
          }),
        ),
      )({
        unique: {
          mapFn: (val) => {
            if (
              typeof val === 'object' &&
              val !== null &&
              'data' in val &&
              typeof val.data === 'object' &&
              val.data !== null &&
              'fieldB' in val.data &&
              typeof val.data.fieldB === 'string'
            ) {
              return val.data.fieldB;
            }
            return undefined;
          },
          elementErrorPath: ['data', 'fieldB'],
        },
      }),
    };
    const result = veto(schema).validate({
      arrayField: [
        { name: 'one', data: { fieldA: 'test', fieldB: 'not-unique' } },
        { name: 'two', data: { fieldB: 'not-unique' } },
      ],
    });

    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          '1': {
            data: {
              fieldB: [
                {
                  code: 'not_unique',
                  message: 'Element already exists',
                },
              ],
            },
          },
          _errors: [
            {
              code: 'not_unique',
              message: 'Array elements are not unique',
              type: 'array',
            },
          ],
        },
      },
    });
  });

  it('array errors are present when elements have errors', () => {
    const schema = {
      arrayField: refineArray(
        array(
          object({
            fieldA: string(),
            fieldB: string(),
          }),
        ),
      )({
        unique: {
          mapFn: (val) => {
            if (
              typeof val === 'object' &&
              val !== null &&
              'fieldA' in val &&
              typeof val.fieldA === 'string'
            ) {
              return val.fieldA;
            }
            return undefined;
          },
        },
      }),
    };
    const result = veto(schema).validate({
      arrayField: [
        //  fieldB should have length of 1
        { fieldA: 'not-unique', fieldB: '' },
        //  fieldB is missing
        { fieldA: 'not-unique' },
      ],
    });

    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          '0': {
            fieldB: [
              {
                code: 'too_small',
                exact: false,
                inclusive: true,
                message: 'String must contain at least 1 character(s)',
                minimum: 1,
                type: 'string',
              },
            ],
          },
          '1': {
            fieldB: [
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Field is required',
                received: 'undefined',
              },
            ],
            _errors: [
              {
                code: 'not_unique',
                message: 'Element already exists',
              },
            ],
          },
          // array _error is present
          _errors: [
            {
              code: 'not_unique',
              message: 'Array elements are not unique',
              type: 'array',
            },
          ],
        },
      },
    });
  });

  it('can be used with optional array', () => {
    const schema = {
      arrayField: refineArray(array(string()).optional())({
        unique: true,
      }),
    };
    const result = veto(schema).validate({});
    expect(result).toStrictEqual({
      success: true,
      data: {},
      errors: null,
    });
  });
});

describe('combined refinements', () => {
  it('can combine custom and unique validations', () => {
    const schema = {
      arrayField: refineArray(array(string()))({
        unique: true,
        custom: (val, ctx) => {
          if (
            Array.isArray(val) &&
            val.some((item) => typeof item === 'string' && item.length < 3)
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'All strings must be at least 3 characters long',
            });
          }
        },
      }),
    };
    const result = veto(schema).validate({
      arrayField: ['one', 'two', 'a', 'one'],
    });
    expect(result).toStrictEqual({
      success: false,
      data: null,
      errors: {
        arrayField: {
          '3': [
            {
              code: 'not_unique',
              message: 'Element already exists',
            },
          ],
          _errors: [
            {
              code: 'custom',
              message: 'All strings must be at least 3 characters long',
            },
            {
              code: 'not_unique',
              message: 'Array elements are not unique',
              type: 'array',
            },
          ],
        },
      },
    });
  });
});
