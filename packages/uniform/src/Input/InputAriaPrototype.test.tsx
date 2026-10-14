import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { number, string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import InputAriaPrototype from './InputAriaPrototype';

// A migrated field must not invoke the legacy renderer or presentation hook.
vi.mock('@heroui/input', () => ({
  Input: () => {
    throw new Error('Legacy input rendered');
  },
  Textarea: () => {
    throw new Error('Legacy textarea rendered');
  },
  useInput: () => {
    throw new Error('Legacy presentation hook invoked');
  },
}));

const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button type="button" onClick={() => reset({ value: 'reset' })}>
      Reset
    </button>
  );
};

describe('React Aria input prototype', () => {
  it('registers, flushes edits on blur/submit, and receives form resets', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: 'initial' }} onSubmit={submit}>
        <InputAriaPrototype name="value" label="Value" debounceDelay={1000} />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    expect(input).toHaveValue('initial');
    await userEvent.clear(input);
    await userEvent.type(input, 'edited');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: 'edited' });
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('reset');
  });

  it('clears pending edits, preserves empty submission behavior and restores focus', async () => {
    const submit = vi.fn();
    const cleared = vi.fn();
    render(
      <Form
        initialValues={{ value: 'initial' }}
        validation={veto({ value: string().optional() })}
        onSubmit={submit}
      >
        <InputAriaPrototype
          name="value"
          label="Value"
          clearable
          onClear={cleared}
          debounceDelay={1000}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    await userEvent.type(input, 'pending');
    await userEvent.click(screen.getByRole('button', { name: 'clear input' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(cleared).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({});
  });

  it('preserves numeric zero, decimal values, empty values and stepper updates', async () => {
    const submit = vi.fn();
    render(
      <Form
        initialValues={{ value: 0 }}
        validation={veto({ value: number().nullable().optional() })}
        onSubmit={submit}
      >
        <InputAriaPrototype
          name="value"
          label="Number"
          type="number"
          clearable
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByLabelText('Number', {
      selector: 'input:not([type="hidden"])',
    });
    expect(input).toHaveValue('0');
    expect(
      screen.getByRole('button', { name: 'clear input' }),
    ).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, '-2.5');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: -2.5 });
    await userEvent.click(
      screen.getByRole('button', { name: /increase|increment/i }),
    );
    expect(input).toHaveValue('-2');
    await userEvent.click(screen.getByRole('button', { name: 'clear input' }));
    expect(input).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    expect(submit.mock.calls[1][0]).toEqual({});
  });

  it('routes invalid form focus and error descriptions to the actual control', async () => {
    render(
      <Form
        validation={veto({ value: string({ min: 3 }) })}
        onSubmit={() => {}}
      >
        <InputAriaPrototype
          name="value"
          label="Value"
          description="Help text"
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByTestId('value_error');
    expect(input).toHaveAccessibleDescription(`Help text ${error.textContent}`);
    expect(input).not.toHaveAttribute('required');
  });

  it('keeps required validation hidden on pristine controls and preserves placeholder naming', () => {
    render(<Form validation={veto({ value: string() })} onSubmit={() => {}}>
      <InputAriaPrototype name="value" placeholder="Enter a value" />
    </Form>);
    const input = screen.getByRole('textbox', { name: 'Enter a value' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('value_error')).not.toBeInTheDocument();
  });
});
