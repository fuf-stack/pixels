import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { object, string, veto } from '@fuf-stack/veto';

import { flatArrayKey } from '../../helpers';
import {
  clientValidationSchemaByName,
  useClientValidation,
} from './useClientValidation';

// Mock the useFormContext hook
const mockSetClientValidationSchema = vi.fn();
const mockTrigger = vi.fn().mockResolvedValue(true);
let mockTouchedFields: Record<string, boolean> = {};

vi.mock('../useFormContext/useFormContext', () => ({
  useFormContext: vi.fn(() => ({
    formState: { touchedFields: mockTouchedFields },
    validation: {
      setClientValidationSchema: mockSetClientValidationSchema,
    },
    trigger: mockTrigger,
  })),
}));

// Mock useId
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useId: vi.fn(() => 'test-id'),
  };
});

// Mock setTimeout to make tests synchronous
vi.mock('global', () => ({
  setTimeout: (fn: () => void) => fn(),
}));

interface TestData {
  existingUsernames: string[];
}

describe('useClientValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTouchedFields = {};
  });

  describe('basic functionality', () => {
    it('should clear validation schema when data is null', () => {
      const schemaFactory = vi.fn();

      renderHook(() => useClientValidation(null, schemaFactory));

      expect(schemaFactory).not.toHaveBeenCalled();
      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        null,
      );
    });

    it('should clear validation schema when data is undefined', () => {
      const schemaFactory = vi.fn();

      renderHook(() => useClientValidation(undefined, schemaFactory));

      expect(schemaFactory).not.toHaveBeenCalled();
      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        null,
      );
    });

    it('should create validation schema when data is provided', () => {
      const mockData = { existingUsernames: ['john', 'jane'] };
      const mockSchema = veto(
        object({
          username: string().refine(() => true),
        }),
      );
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      renderHook(() => useClientValidation(mockData, schemaFactory));

      expect(schemaFactory).toHaveBeenCalledWith(mockData);
      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        mockSchema,
      );
    });
  });

  describe('data changes', () => {
    it('should update validation when data changes', () => {
      const initialData = { existingUsernames: ['john'] };
      const updatedData = { existingUsernames: ['john', 'jane'] };

      const mockSchema1 = veto(object({ username: string() }));
      const mockSchema2 = veto(object({ username: string().min(3) }));

      const schemaFactory = vi
        .fn()
        .mockReturnValueOnce(mockSchema1)
        .mockReturnValueOnce(mockSchema2);

      const { rerender } = renderHook(
        ({ data }: { data: TestData | null }) =>
          useClientValidation(data, schemaFactory),
        {
          initialProps: { data: initialData },
        },
      );

      // Initial call
      expect(schemaFactory).toHaveBeenCalledWith(initialData);
      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        mockSchema1,
      );

      // Update data
      rerender({ data: updatedData });

      expect(schemaFactory).toHaveBeenCalledWith(updatedData);
      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        mockSchema2,
      );
    });

    it('should clear validation when data becomes null', () => {
      const initialData: TestData = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      const { rerender } = renderHook(
        ({ data }: { data: TestData | null }) =>
          useClientValidation(data, schemaFactory),
        {
          initialProps: { data: initialData as TestData | null },
        },
      );

      // Initial call with data
      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        mockSchema,
      );

      // Clear data
      rerender({ data: null });

      expect(mockSetClientValidationSchema).toHaveBeenLastCalledWith(
        'test-id',
        null,
      );
    });

    it('should not re-run when data content is the same but reference changes', () => {
      const data1 = { existingUsernames: ['john'] };
      const data2 = { existingUsernames: ['john'] }; // Same content, different reference
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      const { rerender } = renderHook(
        ({ data }: { data: TestData }) =>
          useClientValidation(data, schemaFactory),
        {
          initialProps: { data: data1 },
        },
      );

      // Initial call
      expect(schemaFactory).toHaveBeenCalledTimes(1);
      expect(mockSetClientValidationSchema).toHaveBeenCalledTimes(1);

      // Rerender with same content but different reference
      rerender({ data: data2 });

      // Should not have been called again due to dataHash optimization
      expect(schemaFactory).toHaveBeenCalledTimes(1);
      expect(mockSetClientValidationSchema).toHaveBeenCalledTimes(1);
    });
  });

  describe('trigger functionality', () => {
    it('should trigger validation for touched fields when data changes', async () => {
      // Set up touched fields before rendering
      mockTouchedFields.username = true;
      mockTouchedFields.email = true;

      const mockData = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      renderHook(() => useClientValidation(mockData, schemaFactory));

      // Wait for setTimeout to execute
      await vi.waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith(['username', 'email']);
      });
    });

    it('should not trigger validation when no fields are touched', async () => {
      mockTouchedFields = {};

      const mockData = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      renderHook(() => useClientValidation(mockData, schemaFactory));

      // Wait to ensure no trigger call
      // eslint-disable-next-line no-promise-executor-return
      await new Promise<void>((resolve) => setTimeout(resolve, 10));

      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('should trigger validation for nested field paths', async () => {
      mockTouchedFields['user.profile.username'] = true;
      mockTouchedFields['items.0.name'] = true;

      const mockData = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      renderHook(() => useClientValidation(mockData, schemaFactory));

      // Wait for setTimeout to execute
      await vi.waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith([
          'user.profile.username',
          'items.0.name',
        ]);
      });
    });

    it('should trigger validation when touched fields change between data updates', async () => {
      mockTouchedFields.username = true;

      const initialData = { existingUsernames: ['john'] };
      const updatedData = { existingUsernames: ['john', 'jane'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      const { rerender } = renderHook(
        ({ data }: { data: TestData }) =>
          useClientValidation(data, schemaFactory),
        {
          initialProps: { data: initialData },
        },
      );

      // Clear mock calls from initial render
      mockTrigger.mockClear();

      // Update touched fields and data
      mockTouchedFields.email = true;

      rerender({ data: updatedData });

      // Wait for setTimeout to execute
      await vi.waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith(['username', 'email']);
      });
    });
  });

  describe('cleanup', () => {
    it('should cleanup validation schema on unmount', () => {
      const data = { existingUsernames: ['john'] };
      const schemaFactory = vi.fn().mockReturnValue(veto(object({})));

      const { unmount } = renderHook(() =>
        useClientValidation(data, schemaFactory),
      );

      unmount();

      expect(mockSetClientValidationSchema).toHaveBeenLastCalledWith(
        'test-id',
        null,
      );
    });
  });

  describe('custom key option', () => {
    it('should use custom key when provided', () => {
      const data = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      renderHook(() =>
        useClientValidation(data, schemaFactory, { key: 'custom-key' }),
      );

      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'custom-key',
        mockSchema,
      );
    });

    it('should use auto-generated key when no custom key provided', () => {
      const data = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      renderHook(() => useClientValidation(data, schemaFactory));

      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        mockSchema,
      );
    });

    it('should allow multiple instances to share validation with same key', () => {
      const data = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      // First instance
      renderHook(() =>
        useClientValidation(data, schemaFactory, { key: 'shared-key' }),
      );

      // Clear mocks
      mockSetClientValidationSchema.mockClear();

      // Second instance with same key (simulating field array)
      renderHook(() =>
        useClientValidation(data, schemaFactory, { key: 'shared-key' }),
      );

      // Both should register with the same key
      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'shared-key',
        mockSchema,
      );
    });

    it('should cleanup with custom key on unmount', () => {
      const data = { existingUsernames: ['john'] };
      const schemaFactory = vi.fn().mockReturnValue(veto(object({})));

      const { unmount } = renderHook(() =>
        useClientValidation(data, schemaFactory, { key: 'cleanup-test-key' }),
      );

      unmount();

      expect(mockSetClientValidationSchema).toHaveBeenLastCalledWith(
        'cleanup-test-key',
        null,
      );
    });

    it('should re-register when data changes with custom key', () => {
      const initialData = { existingUsernames: ['john'] };
      const updatedData = { existingUsernames: ['john', 'jane'] };

      const mockSchema1 = veto(object({ username: string() }));
      const mockSchema2 = veto(object({ username: string().min(3) }));

      const schemaFactory = vi
        .fn()
        .mockReturnValueOnce(mockSchema1)
        .mockReturnValueOnce(mockSchema2);

      const { rerender } = renderHook(
        ({ data }: { data: TestData }) =>
          useClientValidation(data, schemaFactory, { key: 'reregister-key' }),
        {
          initialProps: { data: initialData },
        },
      );

      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'reregister-key',
        mockSchema1,
      );

      // Update data
      rerender({ data: updatedData });

      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'reregister-key',
        mockSchema2,
      );
    });
  });
});

describe('clientValidationSchemaByName helper', () => {
  describe('simple field paths', () => {
    it('should create a loose object schema with a single field', () => {
      const fieldSchema = string().min(3);
      const result = clientValidationSchemaByName('username', fieldSchema);

      // Verify it's an object schema by checking the type (zod v4 uses .type)
      expect(result).toBeDefined();
      expect(result.type).toBe('object');

      // Verify it contains the field with the correct schema
      // In zod v4, shape is a property in .def, not a method
      const shape = result.def?.shape ?? result._def?.shape?.();
      expect(shape.username).toBe(fieldSchema);
    });

    it('should create a schema that validates correctly', () => {
      const fieldSchema = string().refine((val) => val !== 'forbidden', {
        message: 'This value is forbidden',
      });
      const schema = clientValidationSchemaByName('username', fieldSchema);

      // Valid value should pass
      const validResult = schema.safeParse({ username: 'validUser' });
      expect(validResult.success).toBe(true);

      // Invalid value should fail
      const invalidResult = schema.safeParse({ username: 'forbidden' });
      expect(invalidResult.success).toBe(false);
    });

    it('should allow extra fields (loose object behavior)', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName('username', fieldSchema);

      // Should allow extra fields not in the schema
      const result = schema.safeParse({
        username: 'john',
        email: 'john@example.com', // Extra field
        age: 25, // Extra field
      });

      expect(result.success).toBe(true);
    });

    it('should work with complex field schemas', () => {
      const fieldSchema = string()
        .min(3, 'Too short')
        .max(20, 'Too long')
        .refine((val) => /^[a-z0-9]+$/.test(val), {
          message: 'Only lowercase alphanumeric allowed',
        });
      const schema = clientValidationSchemaByName('username', fieldSchema);

      // Valid
      expect(schema.safeParse({ username: 'user123' }).success).toBe(true);

      // Too short
      expect(schema.safeParse({ username: 'ab' }).success).toBe(false);

      // Invalid characters
      expect(schema.safeParse({ username: 'User_123' }).success).toBe(false);
    });
  });

  describe('nested field paths', () => {
    it('should create nested object structure for dotted paths', () => {
      const fieldSchema = string().email();
      const schema = clientValidationSchemaByName('user.email', fieldSchema);

      // Valid nested structure
      const validResult = schema.safeParse({
        user: { email: 'test@example.com' },
      });
      expect(validResult.success).toBe(true);

      // Invalid email should fail
      const invalidResult = schema.safeParse({
        user: { email: 'not-an-email' },
      });
      expect(invalidResult.success).toBe(false);

      // Missing nested object should pass (optional)
      const missingNestedResult = schema.safeParse({});
      expect(missingNestedResult.success).toBe(true);

      // Partial nested object should pass (intermediate objects are optional)
      const partialResult = schema.safeParse({ user: undefined });
      expect(partialResult.success).toBe(true);
    });

    it('should create deeply nested structures', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName(
        'user.profile.settings.theme',
        fieldSchema,
      );

      // Valid deeply nested structure
      const validResult = schema.safeParse({
        user: {
          profile: {
            settings: {
              theme: 'dark',
            },
          },
        },
      });
      expect(validResult.success).toBe(true);

      // Missing deeply nested objects should pass (all intermediate objects are optional)
      const missingResult = schema.safeParse({});
      expect(missingResult.success).toBe(true);

      // Partially defined path should pass
      const partialResult = schema.safeParse({ user: { profile: undefined } });
      expect(partialResult.success).toBe(true);
    });

    it('should allow extra fields at all nesting levels', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName('user.email', fieldSchema);

      // Should allow extra fields at root and nested levels
      const result = schema.safeParse({
        user: {
          email: 'test@example.com',
          name: 'John', // Extra field
          age: 30, // Extra field
        },
        someOtherField: 'value', // Extra field at root
      });

      expect(result.success).toBe(true);
    });
  });

  describe('array field paths', () => {
    it('should handle array indices in paths', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName('items.0.name', fieldSchema);

      // Valid array structure
      const validResult = schema.safeParse({
        items: [{ name: 'Item 1' }],
      });
      expect(validResult.success).toBe(true);

      // Multiple items in array (validates all items)
      const multipleResult = schema.safeParse({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      });
      expect(multipleResult.success).toBe(true);

      // Missing array should pass (array is optional)
      const missingArrayResult = schema.safeParse({});
      expect(missingArrayResult.success).toBe(true);

      // Undefined array should pass
      const undefinedArrayResult = schema.safeParse({ items: undefined });
      expect(undefinedArrayResult.success).toBe(true);
    });

    it('should validate all array elements', () => {
      const fieldSchema = string().min(3);
      const schema = clientValidationSchemaByName('items.0.name', fieldSchema);

      // All valid
      const validResult = schema.safeParse({
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      });
      expect(validResult.success).toBe(true);

      // One invalid (too short)
      const invalidResult = schema.safeParse({
        items: [{ name: 'Item 1' }, { name: 'ab' }],
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should handle nested arrays', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName(
        'users.0.addresses.0.street',
        fieldSchema,
      );

      // Valid nested array structure
      const validResult = schema.safeParse({
        users: [
          {
            addresses: [{ street: 'Main St' }],
          },
        ],
      });
      expect(validResult.success).toBe(true);

      // Multiple nested items
      const multipleResult = schema.safeParse({
        users: [
          {
            addresses: [{ street: 'Main St' }, { street: 'Oak Ave' }],
          },
          {
            addresses: [{ street: 'Elm St' }],
          },
        ],
      });
      expect(multipleResult.success).toBe(true);

      // Missing nested arrays should pass (all arrays are optional)
      const missingResult = schema.safeParse({});
      expect(missingResult.success).toBe(true);

      // Partially defined nested arrays should pass
      const partialResult = schema.safeParse({
        users: [{ addresses: undefined }],
      });
      expect(partialResult.success).toBe(true);
    });

    it('should allow extra fields in array elements', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName('items.0.name', fieldSchema);

      // Should allow extra fields in array elements
      const result = schema.safeParse({
        items: [
          {
            name: 'Item 1',
            price: 100, // Extra field
            category: 'Electronics', // Extra field
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('flat array field paths', () => {
    it('should handle flat array paths with __FLAT__ key', () => {
      const fieldSchema = string().min(2);
      const schema = clientValidationSchemaByName(
        `tags.0.${flatArrayKey}`,
        fieldSchema,
      );

      // Valid flat array structure
      const validResult = schema.safeParse({
        tags: ['tag1', 'tag2', 'tag3'],
      });
      expect(validResult.success).toBe(true);

      // Invalid - string too short
      const invalidResult = schema.safeParse({
        tags: ['a', 'tag2'],
      });
      expect(invalidResult.success).toBe(false);
    });

    it('should create correct schema structure for flat arrays', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName(
        `tags.0.${flatArrayKey}`,
        fieldSchema,
      );

      // The schema should be: objectLoose({ tags: array(string()).optional() })
      // Verify it's an object schema (zod v4 uses .type)
      expect(schema.type).toBe('object');

      // Verify the schema validates flat arrays correctly
      // Valid array of strings
      expect(schema.safeParse({ tags: ['valid'] }).success).toBe(true);

      // Empty array should pass
      expect(schema.safeParse({ tags: [] }).success).toBe(true);

      // Missing array should pass (optional)
      expect(schema.safeParse({}).success).toBe(true);
    });

    it('should allow missing flat arrays (optional)', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName(
        `tags.0.${flatArrayKey}`,
        fieldSchema,
      );

      // Missing array should pass
      const missingResult = schema.safeParse({});
      expect(missingResult.success).toBe(true);

      // Undefined array should pass
      const undefinedResult = schema.safeParse({ tags: undefined });
      expect(undefinedResult.success).toBe(true);
    });

    it('should validate all elements in flat array', () => {
      const fieldSchema = string()
        .min(3)
        .refine((val) => val !== 'forbidden', { message: 'Forbidden value' });
      const schema = clientValidationSchemaByName(
        `tags.0.${flatArrayKey}`,
        fieldSchema,
      );

      // All valid
      const validResult = schema.safeParse({
        tags: ['tag1', 'tag2', 'tag3'],
      });
      expect(validResult.success).toBe(true);

      // One too short
      const invalidResult = schema.safeParse({
        tags: ['tag1', 'ab', 'tag3'],
      });
      expect(invalidResult.success).toBe(false);

      // One forbidden
      const forbiddenResult = schema.safeParse({
        tags: ['tag1', 'forbidden', 'tag3'],
      });
      expect(forbiddenResult.success).toBe(false);
    });

    it('should handle nested paths with flat arrays', () => {
      const fieldSchema = string();
      const schema = clientValidationSchemaByName(
        `user.profile.tags.0.${flatArrayKey}`,
        fieldSchema,
      );

      // Valid nested flat array structure
      const validResult = schema.safeParse({
        user: {
          profile: {
            tags: ['tag1', 'tag2'],
          },
        },
      });
      expect(validResult.success).toBe(true);

      // Missing nested objects should pass (they're optional)
      const missingResult = schema.safeParse({});
      expect(missingResult.success).toBe(true);
    });
  });

  describe('integration', () => {
    it('should integrate with useClientValidation', () => {
      const data = { forbiddenNames: ['admin', 'root'] };
      const schemaFactory = (d: typeof data) =>
        clientValidationSchemaByName(
          'username',
          string().refine((val) => !d.forbiddenNames.includes(val), {
            message: 'This username is not allowed',
          }),
        );

      renderHook(() => useClientValidation(data, schemaFactory));

      expect(mockSetClientValidationSchema).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          type: 'object',
        }),
      );
    });

    it('should work with nested paths in useClientValidation', () => {
      const data = { existingEmails: ['admin@example.com'] };
      const schemaFactory = (d: typeof data) =>
        clientValidationSchemaByName(
          'user.profile.email',
          string()
            .email()
            .refine((val) => !d.existingEmails.includes(val), {
              message: 'Email already exists',
            }),
        );

      renderHook(() => useClientValidation(data, schemaFactory));

      expect(mockSetClientValidationSchema).toHaveBeenCalled();
    });

    it('should properly infer types from the field schema', () => {
      // The return type should be inferred from the input schema
      const stringSchema = clientValidationSchemaByName('username', string());
      const numberSchema = clientValidationSchemaByName('age', string());

      // Verify schemas maintain their structure (zod v4 uses .type)
      expect(stringSchema.type).toBe('object');
      expect(numberSchema.type).toBe('object');
    });
  });
});
