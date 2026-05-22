/* eslint-disable vitest/expect-expect */

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { boolean, number, object, refineObject, string } from 'src';

describe('custom', () => {
  it('preserves refined object schema typing', () => {
    const refined = refineObject(
      object({
        name: string(),
        age: number(),
      }),
    )({
      custom: () => {},
    });

    expectTypeOf(refined.parse({ name: 'admin', age: 20 })).toEqualTypeOf<{
      name: string;
      age: number;
    }>();
  });

  it('supports refining optional objects', () => {
    const refined = refineObject(
      object({
        name: string(),
        age: number(),
      }).optional(),
    )({
      custom: () => {},
    });

    expect(refined.safeParse(undefined).success).toBe(true);
    expectTypeOf(refined.parse).returns.toEqualTypeOf<
      { name: string; age: number } | undefined
    >();
  });

  it('provides type-safe custom helpers for full object checks', () => {
    refineObject(
      object({
        name: string(),
        age: number(),
      }),
    )({
      custom: (data, _ctx, helpers) => {
        expectTypeOf(helpers.parseObject(data)).toEqualTypeOf<{
          name: string;
          age: number;
        } | null>();
        expectTypeOf(
          helpers.parseObject(data, { partial: true }),
        ).toEqualTypeOf<Partial<{ name: string; age: number }> | null>();

        if (helpers.isSchemaObject(data)) {
          expectTypeOf(data).toEqualTypeOf<{ name: string; age: number }>();
        }

        if (helpers.isSchemaObject(data, { partial: true })) {
          expectTypeOf(data).toEqualTypeOf<
            Partial<{ name: string; age: number }>
          >();
        }
      },
    });
  });

  it('supports partial helper mode at runtime', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          age: number(),
        }),
      )({
        custom: (data, ctx, helpers) => {
          if (
            helpers.isSchemaObject(data, { partial: true }) &&
            data.age === undefined
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Age is missing',
              path: ['age'],
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      user: { name: 'admin' },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        user: {
          age: [
            {
              code: 'invalid_type',
              message: 'Field is required',
              received: 'undefined',
            },
            {
              code: 'custom',
              message: 'Age is missing',
            },
          ],
        },
      },
    });
  });

  it('should validate using custom function', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          age: number(),
        }),
      )({
        custom: (data, ctx) => {
          if (
            data.name === 'admin' &&
            typeof data.age === 'number' &&
            data.age < 18
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Admin must be 18 or older',
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      user: { name: 'admin', age: 16 },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        user: {
          _errors: [
            {
              code: 'custom',
              message: 'Admin must be 18 or older',
            },
          ],
        },
      },
    });
  });

  it('should allow valid data', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          age: number(),
        }),
      )({
        custom: (data, ctx) => {
          if (
            data.name === 'admin' &&
            typeof data.age === 'number' &&
            data.age < 18
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Admin must be 18 or older',
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      user: { name: 'admin', age: 20 },
    });

    expect(result).toMatchObject({
      success: true,
    });
  });

  it('should handle multiple validation errors', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          age: number(),
          role: string(),
        }),
      )({
        custom: (data, ctx) => {
          if (
            data.name === 'admin' &&
            typeof data.age === 'number' &&
            data.age < 18
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Admin must be 18 or older',
            });
          }
          if (
            data.role === 'superuser' &&
            typeof data.age === 'number' &&
            data.age < 21
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Superuser must be 21 or older',
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      user: { name: 'admin', age: 16, role: 'superuser' },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        user: {
          _errors: [
            {
              code: 'custom',
              message: 'Admin must be 18 or older',
            },
            {
              code: 'custom',
              message: 'Superuser must be 21 or older',
            },
          ],
        },
      },
    });
  });

  it('should work with optional objects', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          age: number(),
        }).optional(),
      )({
        custom: (data, ctx) => {
          if (
            data.name === 'admin' &&
            typeof data.age === 'number' &&
            data.age < 18
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Admin must be 18 or older',
            });
          }
        },
      }),
    };

    const resultWithData = veto(schema).validate({
      user: { name: 'admin', age: 16 },
    });

    expect(resultWithData).toMatchObject({
      success: false,
      errors: {
        user: {
          _errors: [
            {
              code: 'custom',
              message: 'Admin must be 18 or older',
            },
          ],
        },
      },
    });

    const resultWithoutData = veto(schema).validate({});
    expect(resultWithoutData).toMatchObject({
      success: true,
    });
  });

  it('keeps optional object field optional through refinement wrapper', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
        }).optional(),
      )({
        custom: () => {},
      }),
    };

    expect(veto(schema).validate({}).success).toBe(true);
    expect(veto(schema).validate({ user: undefined }).success).toBe(true);
    expect(veto(schema).validate({ user: null }).success).toBe(false);
  });

  it('should only run validation on objects', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          age: number(),
        }),
      )({
        custom: (_data, ctx) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Should not be called',
          });
        },
      }),
    };

    const result = veto(schema).validate({
      user: 'not an object',
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        user: {
          _errors: expect.arrayContaining([
            expect.objectContaining({
              code: 'invalid_type',
            }),
          ]),
        },
      },
    });
  });

  it('should work with nested objects', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          settings: object({
            theme: string(),
            notifications: boolean(),
          }),
        }),
      )({
        custom: (data, ctx) => {
          const settings = data.settings as Record<string, unknown>;
          if (data.name === 'guest' && settings?.notifications === true) {
            ctx.addIssue({
              code: 'custom',
              message: 'Guests cannot enable notifications',
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      user: {
        name: 'guest',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        user: {
          _errors: [
            {
              code: 'custom',
              message: 'Guests cannot enable notifications',
            },
          ],
        },
      },
    });
  });

  it('should allow adding issues under specific paths', () => {
    const schema = {
      user: refineObject(
        object({
          name: string(),
          settings: object({
            theme: string(),
            notifications: boolean(),
          }),
        }),
      )({
        custom: (data, ctx) => {
          const settings = data.settings as Record<string, unknown>;
          if (data.name === 'guest' && settings?.notifications === true) {
            ctx.addIssue({
              code: 'custom',
              message: 'Notifications cannot be enabled for guests',
              path: ['settings', 'notifications'],
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      user: {
        name: 'guest',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        user: {
          settings: {
            notifications: [
              {
                code: 'custom',
                message: 'Notifications cannot be enabled for guests',
              },
            ],
          },
        },
      },
    });
  });

  it('keeps object-level custom errors alongside nested required errors', () => {
    const schema = {
      identity: refineObject(
        object({
          realName: string(),
          heroName: string(),
          email: string(),
        }),
      )({
        custom: (data, ctx) => {
          if (data.realName === data.heroName) {
            ctx.addIssue({
              code: 'custom',
              message: "Your secret identity isn't very secret if names match!",
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      identity: {
        realName: 'Bruce',
        heroName: 'Bruce',
      },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        identity: {
          _errors: [
            {
              code: 'custom',
              message: "Your secret identity isn't very secret if names match!",
            },
          ],
          email: [
            {
              code: 'invalid_type',
              message: 'Field is required',
              received: 'undefined',
            },
          ],
        },
      },
    });
  });

  it('keeps path-targeted custom errors alongside nested required errors', () => {
    const schema = {
      identity: refineObject(
        object({
          realName: string(),
          heroName: string(),
          email: string(),
        }),
      )({
        custom: (data, ctx) => {
          if (data.realName === data.heroName) {
            ctx.addIssue({
              code: 'custom',
              message: 'Names must differ',
              path: ['heroName'],
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      identity: {
        realName: 'Bruce',
        heroName: 'Bruce',
      },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        identity: {
          heroName: [
            {
              code: 'custom',
              message: 'Names must differ',
            },
          ],
          email: [
            {
              code: 'invalid_type',
              message: 'Field is required',
              received: 'undefined',
            },
          ],
        },
      },
    });
  });

  it('keeps object-level custom errors alongside nested type errors', () => {
    const schema = {
      identity: refineObject(
        object({
          realName: string(),
          heroName: string(),
          email: string(),
        }),
      )({
        custom: (data, ctx) => {
          if (data.realName === data.heroName) {
            ctx.addIssue({
              code: 'custom',
              message: "Your secret identity isn't very secret if names match!",
            });
          }
        },
      }),
    };

    const result = veto(schema).validate({
      identity: {
        realName: 'Bruce',
        heroName: 'Bruce',
        email: 123,
      },
    });

    expect(result).toMatchObject({
      success: false,
      errors: {
        identity: {
          _errors: [
            {
              code: 'custom',
              message: "Your secret identity isn't very secret if names match!",
            },
          ],
          email: [
            {
              code: 'invalid_type',
              message: 'Expected string, received number',
              received: 'number',
            },
          ],
        },
      },
    });
  });
});
