import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import * as stories from './stories/TextArea.stories';
import TextArea from './TextArea';

describe('Story Snapshots', () => {
  // autosizing geometry is verified by the browser story, jsdom only renders it
  storySnapshots({
    ...stories,
    Autosizing: { ...stories.Autosizing, play: undefined },
  });
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ value: 'reset' })} type="button">
      Reset
    </button>
  );
};

describe('Owned production textarea', () => {
  it('registers defaults, flushes multiline edits on blur and receives resets', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: 'initial' }} onSubmit={submit}>
        <TextArea debounceDelay={1000} label="Value" name="value" />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    expect(input).toHaveValue('initial');
    await userEvent.clear(input);
    await userEvent.type(input, 'first{Enter}second');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: 'first\nsecond' });
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('reset');
  });

  it('focuses the actual textarea for invalid submissions and associates help/errors', async () => {
    render(
      <Form onSubmit={() => {}} validation={veto({ value: string() })}>
        <TextArea description="Help text" label="Value" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Value' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('Help text');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByTestId('value_error');
    expect(input).toHaveAccessibleDescription(`Help text ${error.textContent}`);
  });

  it('preserves public slot targets, explicit accessible names and wrapper focus', async () => {
    render(
      <Form onSubmit={() => {}}>
        <TextArea
          ariaLabel="Editor"
          className={{
            base: ['slot-base'],
            inputWrapper: 'slot-wrapper',
            input: 'slot-input',
            clearButton: 'unused-clear-slot',
          }}
          label="Visible"
          name="value"
        />
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Editor' });
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    expect(input).toHaveClass('slot-input');
    expect(wrapper).toHaveClass('slot-wrapper');
    expect(input.closest('[data-slot="base"]')).toHaveClass('slot-base');
    // TextArea retains the clearButton slot type but has no clearable prop/action.
    expect(
      screen.queryByRole('button', { name: 'clear input' }),
    ).not.toBeInTheDocument();
    await userEvent.click(wrapper as HTMLElement);
    expect(input).toHaveFocus();
    expect(input.closest('[data-slot="base"]')).toHaveAttribute(
      'data-focus',
      'true',
    );
  });

  it('keeps disabled fields inert and preserves placeholder naming', async () => {
    render(
      <Form initialValues={{ value: 'initial' }} onSubmit={() => {}}>
        <TextArea disabled name="value" placeholder="Editor" />
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: 'Editor' });
    expect(input).toBeDisabled();
    await userEvent.type(input, 'ignored');
    expect(input).toHaveValue('initial');
  });
});
