import type { InputControlProps } from './InputControl';

import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import FieldValidationError from '../../partials/FieldValidationError';
import InputControl from './InputControl';

const bindings = () =>
  ({
    field: {
      ariaLabel: 'Standalone',
      defaultValue: 'ready',
      description: undefined,
      disabled: false,
      error: undefined,
      customAriaLabel: undefined,
      hasLabel: true,
      hasErrors: false,
      errorMessage: null,
      ids: {
        control: 'standalone',
        label: 'standalone-label',
        description: 'standalone-description',
        error: 'standalone-error',
      },
      ref: vi.fn(),
      invalid: false,
      label: 'Standalone',
      name: 'standalone',
      onBlur: vi.fn(),
      onChange: vi.fn(),
      required: false,
      testId: 'standalone',
      value: 'ready',
    },
    onClear: vi.fn(),
    onReset: vi.fn(),
  }) satisfies InputControlProps;

describe('Input presentation without form context', () => {
  it.each([
    { kind: 'text', type: undefined },
    { kind: 'number', type: 'number' as const },
  ])(
    'keeps the $kind field root, layout and control associations intact',
    async ({ type }) => {
      const props = bindings();
      const { container } = render(
        <InputControl
          {...props}
          field={{
            ...props.field,
            hasErrors: true,
            description: 'Help text',
            errorMessage: (
              <FieldValidationError
                error={[{ type: 'custom', message: 'Invalid value' }]}
                testId="standalone"
              />
            ),
            invalid: true,
            required: true,
            value: type === 'number' ? 0 : 'ready',
          }}
          type={type}
        />,
      );
      const input = screen.getByTestId('standalone');
      const root = container.querySelector('[data-slot="base"]');
      const label = screen.getByText('Standalone');
      const wrapper = container.querySelector('[data-slot="input-wrapper"]');
      const hints = container.querySelector('[data-slot="helper-wrapper"]');

      expect(root?.parentElement).toBe(container);
      expect(container.children).toHaveLength(type === 'number' ? 2 : 1);
      expect(
        container.querySelectorAll('input[type="hidden"][name="standalone"]'),
      ).toHaveLength(type === 'number' ? 1 : 0);
      expect(root).toHaveAttribute('data-required', 'true');
      expect(root).toHaveAttribute('data-invalid', 'true');
      expect(root?.children).toHaveLength(3);
      expect(label.parentElement).toBe(root);
      expect(wrapper?.parentElement).toBe(root);
      expect(hints?.parentElement).toBe(root);
      expect(input).toHaveAccessibleName('Standalone');
      expect(input).toHaveAccessibleDescription('Help text Invalid value');
      expect(props.field.ref).toHaveBeenCalledWith(input);

      Object.values(props.field.ids).forEach((id) => {
        expect(container.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
      });

      await userEvent.click(label);

      expect(input).toHaveFocus();
    },
  );

  it.each([undefined, 'number'] as const)(
    'keeps hover state on the Aria Group for type %s',
    async (type) => {
      const { container } = render(
        <InputControl
          {...bindings()}
          field={{
            ...bindings().field,
            value: type === 'number' ? 0 : 'ready',
          }}
          type={type}
        />,
      );
      const wrapper = container.querySelector(
        '[data-slot="input-wrapper"]',
      ) as HTMLElement;
      const root = container.querySelector('[data-slot="base"]');

      await userEvent.hover(wrapper);

      expect(wrapper).toHaveAttribute('data-hovered', 'true');
      expect(wrapper).not.toHaveAttribute('data-hover');
      expect(root).not.toHaveAttribute('data-hover');

      await userEvent.unhover(wrapper);

      expect(wrapper).not.toHaveAttribute('data-hovered');
    },
  );

  it('does not hover a disabled input group', async () => {
    const { container } = render(
      <InputControl
        {...bindings()}
        field={{ ...bindings().field, disabled: true }}
      />,
    );
    const wrapper = container.querySelector(
      '[data-slot="input-wrapper"]',
    ) as HTMLElement;

    await userEvent.hover(wrapper);

    expect(wrapper).toHaveAttribute('data-disabled', 'true');
    expect(wrapper).not.toHaveAttribute('data-hovered');
  });

  it('updates common state attributes without introducing content flags', () => {
    const props = bindings();
    const { container, rerender } = render(
      <InputControl
        {...props}
        field={{
          ...props.field,
          disabled: true,
          invalid: true,
          required: true,
        }}
      />,
    );
    const root = container.querySelector('[data-slot="base"]');

    expect(root).toHaveAttribute('data-disabled', 'true');
    expect(root).toHaveAttribute('data-invalid', 'true');
    expect(root).toHaveAttribute('data-required', 'true');

    rerender(
      <InputControl
        {...props}
        field={{
          ...props.field,
          disabled: false,
          invalid: false,
          required: false,
        }}
      />,
    );

    expect(container.querySelector('[data-slot="base"]')).toBe(root);
    expect(root).not.toHaveAttribute('data-disabled');
    expect(root).not.toHaveAttribute('data-invalid');
    expect(root).not.toHaveAttribute('data-required');
  });

  it('forwards edits and clearing while owning focus and retaining the editable ref', async () => {
    const props = bindings();
    const { rerender } = render(<InputControl {...props} clearable />);
    const input = screen.getByRole('textbox', { name: 'Standalone' });
    expect(props.field.ref).toHaveBeenCalledWith(input);
    await userEvent.type(input, '!');
    expect(props.field.onChange).toHaveBeenLastCalledWith('ready!');
    await userEvent.click(screen.getByRole('button', { name: 'clear input' }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(props.onReset.mock.invocationCallOrder[0]).toBeLessThan(
      props.onClear.mock.invocationCallOrder[0],
    );
    expect(input).toHaveFocus();

    input.blur();
    expect(input).not.toHaveFocus();
    await userEvent.click(
      input.closest('[data-slot="input-wrapper"]') as HTMLElement,
    );
    expect(input).toHaveFocus();
    rerender(
      <InputControl
        {...props}
        clearable
        field={{ ...props.field, value: '' }}
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Standalone' })).toBe(input);
    expect(input).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'clear input' }),
    ).not.toBeInTheDocument();
  });

  it('clears with Escape and restores focus without a consumer callback', async () => {
    const props = bindings();
    render(<InputControl {...props} clearable onClear={undefined} />);
    const input = screen.getByRole('textbox', { name: 'Standalone' });

    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');

    expect(props.onReset).toHaveBeenCalledOnce();
    expect(input).toHaveFocus();
  });

  it('forwards callback refs and releases them when the input unmounts', () => {
    const inputRef = vi.fn();
    const { unmount } = render(
      <InputControl
        {...bindings()}
        field={{ ...bindings().field, ref: inputRef }}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Standalone' });

    expect(inputRef).toHaveBeenLastCalledWith(input);

    unmount();

    expect(inputRef).toHaveBeenLastCalledWith(null);
  });

  it('connects extracted number steppers to their Aria context and preserves zero and empty displays', async () => {
    const props = bindings();
    const { rerender } = render(
      <InputControl
        {...props}
        clearable
        field={{ ...props.field, value: 0 }}
        type="number"
      />,
    );
    const input = screen.getByTestId('standalone');
    expect(props.field.ref).toHaveBeenCalledWith(input);
    expect(input).toHaveValue('0');
    expect(input.closest('[data-slot="base"]')).toHaveAttribute(
      'data-filled',
      'true',
    );
    const increment = screen.getByRole('button', { name: /increase/i });
    expect(increment).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: /decrease/i })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    await userEvent.click(increment);
    expect(props.field.onChange).toHaveBeenLastCalledWith('1');
    rerender(
      <InputControl
        {...props}
        clearable
        field={{ ...props.field, value: null }}
        type="number"
      />,
    );
    expect(screen.getByTestId('standalone')).toBe(input);
    expect(input).toHaveValue('');
    expect(input.closest('[data-slot="base"]')).not.toHaveAttribute(
      'data-filled',
    );
  });
});
