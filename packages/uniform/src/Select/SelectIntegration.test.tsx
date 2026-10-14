import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { array, number, veto } from '@fuf-stack/veto';

import Form from '../Form';
import Select from './Select';

vi.mock('../hooks/useInput/useInput', () => ({
  useInput: () => {
    throw new Error('Legacy presentation hook invoked');
  },
}));

const options = [
  { value: 0, label: 'Zero' },
  { value: 2, label: 'Two' },
];

describe('Owned React Select integration', () => {
  it('associates visible labels, required state, help and errors with the real input', async () => {
    render(
      <Form onSubmit={() => {}} validation={veto({ choice: number() })}>
        <Select
          description="Pick a number"
          label="Choice"
          name="choice"
          options={options}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('combobox', { name: 'Choice' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining('Pick a number'),
    );
    const label = screen.getByText('Choice');
    expect(label).toHaveAttribute('for', input.id);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByTestId('choice_error');
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining(error.textContent ?? ''),
    );
    // Keep React Select's own announcements alongside the field description.
    expect(input.getAttribute('aria-describedby')).toContain('placeholder');
  });

  it('preserves numeric zero selection and optional clearing submission', async () => {
    const submit = vi.fn();
    render(
      <Form
        onSubmit={submit}
        validation={veto({ choice: number().optional() })}
      >
        <Select label="Choice" name="choice" options={options} />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('combobox', { name: 'Choice' });
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'Zero' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: 0 });
    await userEvent.click(input);
    await userEvent.keyboard('{Escape}{Backspace}');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    expect(submit.mock.calls[1][0]).toEqual({});
  });

  it('binds public container and icon slots while preserving multiselect values', async () => {
    const submit = vi.fn();
    const { container } = render(
      <Form
        initialValues={{ choice: [0, 2] }}
        onSubmit={submit}
        validation={veto({ choice: array(number()) })}
      >
        <Select
          className={{
            selectContainer: 'slot-container',
            multiValueContainer: 'slot-value',
            crossIcon: 'slot-cross',
            downChevron: 'slot-chevron',
          }}
          label="Choice"
          multiSelect
          name="choice"
          options={options}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(container.querySelector('.slot-container')).toBeInTheDocument();
    expect(container.querySelectorAll('.slot-value')).toHaveLength(2);
    expect(container.querySelector('.slot-cross')).toBeInTheDocument();
    expect(container.querySelector('.slot-chevron')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove Zero' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: [2] });
  });

  it('gives repeated field names distinct control and announcement IDs', () => {
    render(
      <>
        <Form onSubmit={() => {}}>
          <Select label="First" name="choice" options={options} />
        </Form>
        <Form onSubmit={() => {}}>
          <Select label="Second" name="choice" options={options} />
        </Form>
      </>,
    );
    const first = screen.getByRole('combobox', { name: 'First' });
    const second = screen.getByRole('combobox', { name: 'Second' });
    expect(first.id).not.toBe(second.id);
    expect(first.getAttribute('aria-describedby')).not.toBe(
      second.getAttribute('aria-describedby'),
    );
  });
});
