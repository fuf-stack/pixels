import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { number, string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import Input from './Input';
import * as stories from './Input.stories';

const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ value: 'reset' })} type="button">
      Reset
    </button>
  );
};

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Production React Aria input', () => {
  it('registers, flushes edits on blur/submit, and receives form resets', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: 'initial' }} onSubmit={submit}>
        <Input debounceDelay={1000} label="Value" name="value" />
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
        onSubmit={submit}
        validation={veto({ value: string().optional() })}
      >
        <Input
          clearable
          debounceDelay={1000}
          label="Value"
          name="value"
          onClear={cleared}
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
        onSubmit={submit}
        validation={veto({ value: number().nullable().optional() })}
      >
        <Input clearable label="Number" name="value" type="number" />
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
        onSubmit={() => {}}
        validation={veto({ value: string({ min: 3 }) })}
      >
        <Input description="Help text" label="Value" name="value" />
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
    render(
      <Form onSubmit={() => {}} validation={veto({ value: string() })}>
        <Input name="value" placeholder="Enter a value" />
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Enter a value' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('value_error')).not.toBeInTheDocument();
  });

  it('preserves every public slot target, addons, explicit names and password editing', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ password: 'initial' }} onSubmit={submit}>
        <Input
          ariaLabel="Secret"
          className={{
            base: ['slot-base', 'mt-4'],
            inputWrapper: 'slot-wrapper',
            input: 'slot-input',
            clearButton: 'slot-clear',
          }}
          clearable
          endContent={<span>End</span>}
          label="Visible label"
          name="password"
          startContent={<span>Start</span>}
          type="password"
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByLabelText('Secret');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveClass('slot-input');
    expect(input.closest('[data-slot="base"]')).toHaveClass(
      'slot-base',
      'mt-4',
    );
    expect(input.closest('[data-slot="input-wrapper"]')).toHaveClass(
      'slot-wrapper',
    );
    expect(screen.getByRole('button', { name: 'clear input' })).toHaveClass(
      'slot-clear',
    );
    expect(screen.getByText('Start')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'clear input' }),
    ).toContainElement(screen.getByText('End'));
    await userEvent.clear(input);
    expect(screen.queryByText('End')).not.toBeInTheDocument();
    await userEvent.type(input, 'edited');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ password: 'edited' });
  });

  it('applies consumer classes to labels, hints, validation messages and number steppers', async () => {
    render(
      <Form
        initialValues={{ amount: 0 }}
        onSubmit={() => {}}
        validation={veto({ amount: number().min(1, 'Choose at least one') })}
      >
        <Input
          className={{
            description: 'custom-description',
            errorMessage: 'custom-error text-small',
            helperWrapper: 'custom-hints',
            innerWrapper: 'custom-inner',
            label: 'custom-label',
            stepper: 'custom-stepper',
            stepperButton: 'custom-stepper-button',
          }}
          clearable
          description="Number of items"
          label="Amount"
          name="amount"
          type="number"
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByTestId('amount');
    const root = input.closest('[data-slot="base"]');

    expect(screen.getByText('Amount')).toHaveClass('custom-label');
    expect(screen.getByText('Number of items')).toHaveClass(
      'custom-description',
    );
    expect(root?.querySelector('[data-slot="inner-wrapper"]')).toHaveClass(
      'custom-inner',
    );
    expect(root?.querySelector('[data-slot="helper-wrapper"]')).toHaveClass(
      'custom-hints',
    );
    expect(root?.querySelector('[data-slot="stepper-wrapper"]')).toHaveClass(
      'custom-stepper',
    );
    expect(
      screen.getByRole('button', { name: /increase|increment/i }),
    ).toHaveClass('custom-stepper-button');
    expect(
      screen.getByRole('button', { name: /decrease|decrement/i }),
    ).toHaveClass('custom-stepper-button');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));

    expect(root?.querySelector('[data-slot="error-message"]')).toHaveClass(
      'custom-error',
      'text-small',
    );
    expect(screen.getByText('Choose at least one')).toBeVisible();
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription(
      'Number of items Choose at least one',
    );
  });

  it('keeps disabled controls and clear actions inert', async () => {
    const cleared = vi.fn();
    render(
      <Form initialValues={{ value: 'initial' }} onSubmit={() => {}}>
        <Input
          clearable
          disabled
          label="Value"
          name="value"
          onClear={cleared}
        />
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    const clear = screen.getByRole('button', { name: 'clear input' });
    expect(input).toBeDisabled();
    expect(clear).toBeDisabled();
    await userEvent.type(input, 'ignored');
    await userEvent.click(clear);
    expect(input).toHaveValue('initial');
    expect(cleared).not.toHaveBeenCalled();
  });

  it('focuses the editable control from wrapper padding and retains state selectors', async () => {
    render(
      <Form onSubmit={() => {}} validation={veto({ value: string() })}>
        <Input label="Value" name="value" />
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    const base = input.closest('[data-slot="base"]');
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    expect(base).toHaveAttribute('data-required', 'true');
    expect(base).not.toHaveAttribute('data-filled');
    expect(base).not.toHaveAttribute('data-has-label');
    expect(base).not.toHaveAttribute('data-has-helper');
    expect(base).not.toHaveAttribute('data-has-elements');
    expect(base).not.toHaveAttribute('data-has-value');
    expect(base).not.toHaveAttribute('data-filled-within');
    expect(base).not.toHaveAttribute('data-focus-within');
    await userEvent.click(wrapper as HTMLElement);
    expect(input).toHaveFocus();
    expect(base).toHaveAttribute('data-focus', 'true');
    await userEvent.type(input, 'value');
    expect(base).toHaveAttribute('data-filled', 'true');
    expect(base).toHaveClass('is-filled');
    expect(input).toHaveAttribute('data-filled', 'true');
  });
});
