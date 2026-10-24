import type { ButtonProps } from './Button';

import '@testing-library/jest-dom/vitest';

import { describe, expect, it, vi } from 'vitest';

import { createRef } from 'react';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createStyling } from '@fuf-stack/pixel-utils';

import { StylingProvider } from '../StylingProvider';
import Button from './Button';
import * as interactionStories from './stories/Button.interactions.stories';
import * as stories from './stories/Button.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
});

describe('Button interactions', () => {
  it('activates by pointer, Enter and Space using press events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<NonNullable<ButtonProps['onClick']>>();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });

    await user.click(button);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(3);
    expect(onClick.mock.calls.map(([event]) => event.pointerType)).toEqual([
      'mouse',
      'keyboard',
      'keyboard',
    ]);
    expect(onClick.mock.calls[0][0].target).toBe(button);
  });

  it.each([{ disabled: true }, { loading: true }])(
    'prevents activation while %o',
    async (props) => {
      const user = userEvent.setup();
      const onClick = vi.fn<NonNullable<ButtonProps['onClick']>>();
      render(
        <Button {...props} onClick={onClick}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Save' });

      await user.click(button);
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });

      expect(button).toBeDisabled();
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it('forwards the native ref and focus callbacks', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <Button ref={ref} onBlur={onBlur} onFocus={onFocus}>
          Save
        </Button>
        <input aria-label="Next" />
      </>,
    );

    await user.tab();
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current).toHaveFocus();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(ref.current).toHaveAttribute('data-focus-visible', 'true');

    await user.tab();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('keeps ordinary buttons out of form submission and supports external submit and reset', async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event) => {
      event.preventDefault();
    });
    render(
      <>
        <form id="example" onSubmit={submit}>
          <input aria-label="Name" defaultValue="Before" />
          <Button>Ordinary</Button>
        </form>
        <Button form="example" type="submit">
          Submit
        </Button>
        <Button form="example" type="reset">
          Reset
        </Button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Ordinary' }));
    expect(submit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(submit).toHaveBeenCalledOnce();
    await user.type(screen.getByRole('textbox'), ' edited');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('textbox')).toHaveValue('Before');
  });

  it('keeps an icon button named while its decorative spinner is visible', () => {
    render(
      <Button ariaLabel="Send" icon={<span aria-hidden>✉</span>} loading />,
    );
    const button = screen.getByRole('button', { name: 'Send' });

    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies consumer merge rules without losing the foreground color', () => {
    const styling = createStyling({
      extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
    });
    render(
      <StylingProvider styling={styling}>
        <Button className="text-body" color="danger">
          Delete
        </Button>
      </StylingProvider>,
    );
    const button = screen.getByRole('button');

    expect(button).toHaveClass('text-body', 'text-danger-foreground');
    expect(button).not.toHaveClass('text-small');
  });
});
