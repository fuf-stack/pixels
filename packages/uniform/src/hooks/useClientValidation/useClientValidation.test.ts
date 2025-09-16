import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { object, string, veto } from '@fuf-stack/veto';

import { useClientValidation } from './useClientValidation';

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
      const initialData = { existingUsernames: ['john'] };
      const mockSchema = veto(object({ username: string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      const { rerender } = renderHook(
        ({ data }: { data: TestData | null }) =>
          useClientValidation(data, schemaFactory),
        {
          initialProps: { data: initialData },
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
});
