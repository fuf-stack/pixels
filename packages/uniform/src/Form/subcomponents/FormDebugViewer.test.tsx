/* eslint-disable react/require-default-props */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, render, screen } from '@testing-library/react';

import FormDebugViewer from './FormDebugViewer';

const { mockUseFormContext } = vi.hoisted(() => ({
  mockUseFormContext: vi.fn(),
}));

vi.mock('../../hooks/useFormContext', () => ({
  useFormContext: mockUseFormContext,
}));

vi.mock('@fuf-stack/pixels/Button', () => ({
  Button: ({
    ariaLabel,
    children,
    onClick,
  }: {
    ariaLabel?: string;
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button aria-label={ariaLabel} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

vi.mock('@fuf-stack/pixels/Card', () => ({
  Card: ({
    children,
    header,
  }: {
    children?: React.ReactNode;
    header?: React.ReactNode;
  }) => (
    <section>
      <header>{header}</header>
      <div>{children}</div>
    </section>
  ),
}));

vi.mock('@fuf-stack/pixels/Json', () => ({
  Json: ({ value }: { value: unknown }) => (
    <pre data-testid="debug-json">{JSON.stringify(value)}</pre>
  ),
}));

describe('FormDebugViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not subscribe while debug card is hidden', () => {
    const subscribe = vi.fn();

    mockUseFormContext.mockReturnValue({
      debugMode: 'off',
      formState: {
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValid: true,
        submitCount: 0,
      },
      getValues: () => ({ username: 'john' }),
      setDebugMode: vi.fn(),
      subscribe,
      validation: { errors: undefined },
    });

    render(<FormDebugViewer />);

    expect(
      screen.getByRole('button', { name: 'Enable form debug mode' }),
    ).toBeInTheDocument();
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('subscribes when visible and reflects latest form values', () => {
    let currentValues: Record<string, unknown> = { username: 'john' };
    let notifyValuesChanged: (() => void) | undefined;
    const unsubscribe = vi.fn();

    const subscribe = vi
      .fn()
      .mockImplementation(
        ({
          callback,
        }: {
          callback: (state: { values?: Record<string, unknown> }) => void;
        }) => {
          notifyValuesChanged = () => {
            callback({ values: currentValues });
          };

          return unsubscribe;
        },
      );

    const getValues = vi.fn(() => currentValues);

    mockUseFormContext.mockReturnValue({
      debugMode: 'debug',
      formState: {
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValid: true,
        submitCount: 1,
      },
      getValues,
      setDebugMode: vi.fn(),
      subscribe,
      validation: { errors: undefined },
    });

    const { unmount } = render(<FormDebugViewer />);

    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        formState: { values: true },
      }),
    );
    expect(getValues).toHaveBeenCalled();

    const initialPayload = JSON.parse(
      screen.getByTestId('debug-json').textContent ?? '{}',
    ) as { values: Record<string, unknown> };
    expect(initialPayload.values).toEqual({ username: 'john' });

    currentValues = { username: 'sarah' };
    act(() => {
      notifyValuesChanged?.();
    });

    const updatedPayload = JSON.parse(
      screen.getByTestId('debug-json').textContent ?? '{}',
    ) as { values: Record<string, unknown> };
    expect(updatedPayload.values).toEqual({ username: 'sarah' });

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
