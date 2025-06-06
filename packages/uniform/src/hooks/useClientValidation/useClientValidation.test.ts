import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { useClientValidation } from './useClientValidation';

// Mock the UniformContext
vi.mock('../../Form/subcomponents/FormContext', () => ({
  UniformContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock useContext to return our mock context
const mockSetClientValidationSchema = vi.fn();
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useContext: vi.fn(() => ({
      validation: {
        setClientValidationSchema: mockSetClientValidationSchema,
      },
    })),
    useId: vi.fn(() => 'test-id'),
  };
});

describe('useClientValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        vt.object({
          username: vt.string().refine(() => true),
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

      const mockSchema1 = veto(vt.object({ username: vt.string() }));
      const mockSchema2 = veto(vt.object({ username: vt.string().min(3) }));

      const schemaFactory = vi
        .fn()
        .mockReturnValueOnce(mockSchema1)
        .mockReturnValueOnce(mockSchema2);

      const { rerender } = renderHook(
        ({ data }: { data: { existingUsernames: string[] } | null }) =>
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
      const mockSchema = veto(vt.object({ username: vt.string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      const { rerender } = renderHook(
        ({ data }: { data: { existingUsernames: string[] } | null }) =>
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
      const mockSchema = veto(vt.object({ username: vt.string() }));
      const schemaFactory = vi.fn().mockReturnValue(mockSchema);

      const { rerender } = renderHook(
        ({ data }: { data: { existingUsernames: string[] } }) =>
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

  describe('cleanup', () => {
    it('should cleanup validation schema on unmount', () => {
      const data = { existingUsernames: ['john'] };
      const schemaFactory = vi.fn().mockReturnValue(veto(vt.object({})));

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
