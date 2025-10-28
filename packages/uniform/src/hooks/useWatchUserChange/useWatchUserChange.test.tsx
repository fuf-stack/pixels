import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useWatchUserChange } from './useWatchUserChange';

// Mock useFormContext
interface MockFormContextReturn {
  setValue: ReturnType<typeof vi.fn>;
  resetField: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  userChange: {
    subscribe: ReturnType<typeof vi.fn>;
    notify: ReturnType<typeof vi.fn>;
  };
}

let mockFormContext: () => MockFormContextReturn;
vi.mock('../useFormContext/useFormContext', () => ({
  useFormContext: () => mockFormContext(),
}));

interface FormData {
  country?: string;
  city?: string;
  address?: string;
  paymentMethod?: string;
  installments?: number;
  category?: string;
  brand?: string;
  productId?: string;
}

describe('useWatchUserChange', () => {
  let mockSetValue: ReturnType<typeof vi.fn>;
  let mockResetField: ReturnType<typeof vi.fn>;
  let mockReset: ReturnType<typeof vi.fn>;
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let mockNotify: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSetValue = vi.fn();
    mockResetField = vi.fn();
    mockReset = vi.fn();
    mockSubscribe = vi.fn(
      () => vi.fn(), // Return unsubscribe function
    );
    mockNotify = vi.fn();

    mockFormContext = () => ({
      setValue: mockSetValue,
      resetField: mockResetField,
      reset: mockReset,
      userChange: {
        subscribe: mockSubscribe,
        notify: mockNotify,
      },
    });
  });

  it('should subscribe to user changes on mount', () => {
    const onChange = vi.fn();

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'country',
        onChange,
      }),
    );

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should unsubscribe on unmount', () => {
    const onChange = vi.fn();
    const unsubscribe = vi.fn();
    mockSubscribe.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'country',
        onChange,
      }),
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should call onChange when watched field changes', () => {
    const onChange = vi.fn();
    let subscribedListener:
      | ((fieldName: string, value: unknown) => void)
      | undefined;

    mockSubscribe.mockImplementation((listener) => {
      subscribedListener = listener;
      return vi.fn();
    });

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'country',
        onChange,
      }),
    );

    // Simulate user changing the field
    subscribedListener?.('country', 'Canada');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      'Canada',
      expect.objectContaining({
        setValue: mockSetValue,
        resetField: mockResetField,
        reset: mockReset,
      }),
    );
  });

  it('should NOT call onChange when unwatched field changes', () => {
    const onChange = vi.fn();
    let subscribedListener:
      | ((fieldName: string, value: unknown) => void)
      | undefined;

    mockSubscribe.mockImplementation((listener) => {
      subscribedListener = listener;
      return vi.fn();
    });

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'country',
        onChange,
      }),
    );

    // Simulate user changing a different field
    subscribedListener?.('city', 'Toronto');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should watch single field only', () => {
    const onChange = vi.fn();
    let subscribedListener:
      | ((fieldName: string, value: unknown) => void)
      | undefined;

    mockSubscribe.mockImplementation((listener) => {
      subscribedListener = listener;
      return vi.fn();
    });

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'category',
        onChange,
      }),
    );

    // Change category - should trigger
    subscribedListener?.('category', 'electronics');

    expect(onChange).toHaveBeenCalledWith('electronics', expect.any(Object));

    onChange.mockClear();

    // Change brand - should NOT trigger (not watched)
    subscribedListener?.('brand', 'sony');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should provide setValue helper that works', () => {
    let subscribedListener:
      | ((fieldName: string, value: unknown) => void)
      | undefined;

    mockSubscribe.mockImplementation((listener) => {
      subscribedListener = listener;
      return vi.fn();
    });

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'paymentMethod',
        onChange: (value, { setValue }) => {
          if (value === 'credit') {
            setValue('installments', 3);
          }
        },
      }),
    );

    subscribedListener?.('paymentMethod', 'credit');

    expect(mockSetValue).toHaveBeenCalledWith('installments', 3);
  });

  it('should provide resetField helper that works', () => {
    let subscribedListener:
      | ((fieldName: string, value: unknown) => void)
      | undefined;

    mockSubscribe.mockImplementation((listener) => {
      subscribedListener = listener;
      return vi.fn();
    });

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'country',
        onChange: (value, { resetField }) => {
          resetField('city');
          resetField('address');
        },
      }),
    );

    subscribedListener?.('country', 'Canada');

    expect(mockResetField).toHaveBeenCalledWith('city');
    expect(mockResetField).toHaveBeenCalledWith('address');
  });

  it('should provide reset helper that works', () => {
    let subscribedListener:
      | ((fieldName: string, value: unknown) => void)
      | undefined;

    mockSubscribe.mockImplementation((listener) => {
      subscribedListener = listener;
      return vi.fn();
    });

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'country',
        onChange: (value, { reset }) => {
          reset();
        },
      }),
    );

    subscribedListener?.('country', 'Canada');

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should work with value-based conditional logic', () => {
    let subscribedListener:
      | ((fieldName: string, value: unknown) => void)
      | undefined;

    mockSubscribe.mockImplementation((listener) => {
      subscribedListener = listener;
      return vi.fn();
    });

    renderHook(() =>
      useWatchUserChange<FormData>({
        watch: 'paymentMethod',
        onChange: (value, { setValue }) => {
          // Set defaults based on payment method value
          if (value === 'credit') {
            setValue('installments', 3);
          } else {
            setValue('installments', 1);
          }
        },
      }),
    );

    // Set to credit
    subscribedListener?.('paymentMethod', 'credit');
    expect(mockSetValue).toHaveBeenCalledWith('installments', 3);

    mockSetValue.mockClear();

    // Set to cash
    subscribedListener?.('paymentMethod', 'cash');
    expect(mockSetValue).toHaveBeenCalledWith('installments', 1);
  });
});
