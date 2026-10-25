import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { boolean, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import * as stories from './stories/SwitchBox.stories';
import SwitchBox from './SwitchBox';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ value: true })} type="button">
      Reset
    </button>
  );
};

describe('Owned switch box control', () => {
  it('uses one registered input and preserves boolean values, keyboard changes and resets', async () => {
    const submit = vi.fn();
    const { container } = render(
      <Form
        initialValues={{ value: false }}
        onSubmit={submit}
        validation={veto({ value: boolean() })}
      >
        <SwitchBox label="Value" name="value" />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('switch', { name: 'Value' });
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(
      1,
    );
    expect(input).toHaveAttribute('name', 'value');
    expect(input).not.toBeChecked();
    expect(input).not.toHaveAttribute('required');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: false });
    await userEvent.click(screen.getByTestId('value'));
    expect(input).toBeChecked();
    input.focus();
    await userEvent.keyboard(' ');
    expect(input).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toBeChecked();
  });

  it('focuses the actual switch for invalid submit and associates help/errors', async () => {
    render(
      <Form onSubmit={() => {}} validation={veto({ value: boolean() })}>
        <SwitchBox description="Help text" label="Value" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('switch', { name: 'Value' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAccessibleDescription('Help text');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    const error = screen.getByTestId('value_error');
    expect(input).toHaveAccessibleDescription(`Help text ${error.textContent}`);
  });

  it('keeps disabled switches inert and forwards the supported thumb callback props', async () => {
    const icon = vi.fn(({ isSelected, className }) => (
      <span className={className}>{isSelected ? 'On' : 'Off'}</span>
    ));
    render(
      <Form initialValues={{ value: true }} onSubmit={() => {}}>
        <SwitchBox
          className={{ thumbIcon: 'slot-icon' }}
          disabled
          label="Value"
          name="value"
          thumbIcon={icon}
        />
      </Form>,
    );
    const input = screen.getByRole('switch', { name: 'Value' });
    expect(input).toBeDisabled();
    expect(input).toBeChecked();
    expect(icon).toHaveBeenLastCalledWith(
      expect.objectContaining({
        width: '1em',
        height: '1em',
        'data-checked': 'true',
        isSelected: true,
        className: expect.stringContaining('slot-icon'),
      }),
    );
    expect(screen.getByText('On')).toHaveClass('slot-icon');
    await userEvent.click(screen.getByTestId('value'));
    expect(input).toBeChecked();
  });
});
