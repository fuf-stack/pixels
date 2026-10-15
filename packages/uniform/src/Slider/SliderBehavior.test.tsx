import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { number, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import Slider from './Slider';

vi.mock('../hooks/useInput/useInput', () => ({
  useInput: () => {
    throw new Error('Legacy presentation hook invoked');
  },
}));
const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ value: 0 })} type="button">
      Reset
    </button>
  );
};

describe('Owned slider control', () => {
  it('registers one range input and preserves numeric zero, fractional steps and reset', async () => {
    const submit = vi.fn();
    const { container } = render(
      <Form initialValues={{ value: 0 }} onSubmit={submit}>
        <Slider
          label="Amount"
          name="value"
          minValue={-10}
          maxValue={10}
          step={0.5}
        />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('slider', { name: 'Amount' });
    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(1);
    expect(input).toHaveAttribute('name', 'value');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: 0 });
    input.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(input).toHaveValue('0.5');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('0');
  });

  it('focuses the editable input, associates help/errors and commits an explicit zero selection', async () => {
    const submit = vi.fn();
    render(
      <Form onSubmit={submit} validation={veto({ value: number() })}>
        <Slider description="Choose an amount." label="Amount" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('slider', { name: 'Amount' });
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAccessibleDescription(
      'Choose an amount. Required selection.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(submit).not.toHaveBeenCalled();
    const error = screen.getByTestId('value_error');
    expect(input).toHaveAccessibleDescription(
      `Choose an amount. ${error.textContent} Required selection.`,
    );
    await userEvent.keyboard('{Home}');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(submit.mock.calls[0][0]).toEqual({ value: 0 });
  });

  it('keeps disabled inputs inert and retains disabled submission omission', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: 25 }} onSubmit={submit}>
        <Slider disabled label="Amount" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('slider', { name: 'Amount' });
    expect(input).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({});
  });
});
