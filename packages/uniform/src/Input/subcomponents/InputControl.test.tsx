import type { InputControlProps } from './InputControl';

import { describe, expect, it, vi } from 'vitest';

import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import InputControl from './InputControl';

const bindings = () =>
  ({
    controlProps: { id: 'standalone', 'aria-labelledby': 'standalone-label' },
    errorMessage: null,
    ids: {
      control: 'standalone',
      label: 'standalone-label',
      description: 'standalone-description',
      error: 'standalone-error',
    },
    inputRef: createRef<HTMLInputElement>(),
    invalid: false,
    label: 'Standalone',
    name: 'standalone',
    onBlur: vi.fn(),
    onClear: vi.fn(),
    onFocusControl: vi.fn(),
    onValueChange: vi.fn(),
    required: false,
    testId: 'standalone',
    value: 'ready',
  }) satisfies InputControlProps;

describe('Input presentation without form context', () => {
  it('forwards editing, clear and focus callbacks while retaining the editable ref across value updates', async () => {
    const props = bindings();
    const { rerender } = render(<InputControl {...props} clearable />);
    const input = screen.getByRole('textbox', { name: 'Standalone' });
    expect(props.inputRef.current).toBe(input);
    await userEvent.type(input, '!');
    expect(props.onValueChange).toHaveBeenLastCalledWith('ready!');
    await userEvent.click(screen.getByRole('button', { name: 'clear input' }));
    expect(props.onClear).toHaveBeenCalledTimes(1);
    await userEvent.click(
      input.closest('[data-slot="input-wrapper"]') as HTMLElement,
    );
    expect(props.onFocusControl).toHaveBeenCalledTimes(1);
    rerender(<InputControl {...props} clearable value="" />);
    expect(screen.getByRole('textbox', { name: 'Standalone' })).toBe(input);
    expect(input).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'clear input' }),
    ).not.toBeInTheDocument();
  });

  it('connects extracted number steppers to their Aria context and preserves zero and empty displays', async () => {
    const props = bindings();
    const { rerender } = render(
      <InputControl {...props} clearable type="number" value={0} />,
    );
    const input = screen.getByTestId('standalone');
    expect(props.inputRef.current).toBe(input);
    expect(input).toHaveValue('0');
    const increment = screen.getByRole('button', { name: /increase/i });
    expect(increment).toHaveAttribute('tabindex', '-1');
    await userEvent.click(increment);
    expect(props.onValueChange).toHaveBeenLastCalledWith('1');
    rerender(<InputControl {...props} clearable type="number" value={null} />);
    expect(screen.getByTestId('standalone')).toBe(input);
    expect(input).toHaveValue('');
  });
});
