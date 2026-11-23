import type { ReactNode } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { forwardRef, memo } from 'react';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { userEvent } from 'storybook/test';

import * as interactionStories from './stories/Tooltip.interactions.stories';
import * as stories from './stories/Tooltip.stories';
import { isFocusableTrigger } from './subcomponents/TooltipTriggerElement';
import Tooltip from './Tooltip';

// like a label or icon component: neither forwards a ref nor spreads props
const Chip = ({ children }: { children: ReactNode }) => <span>{children}</span>;

const RefButton = forwardRef<HTMLButtonElement, { children: ReactNode }>(
  ({ children }, ref) => (
    <button ref={ref} type="button">
      {children}
    </button>
  ),
);

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
});

describe('Tooltip behavior', () => {
  it('associates focused trigger content with the tooltip and closes on Escape', async () => {
    render(
      <Tooltip closeDelay={0} content="Details">
        <button type="button">Help</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Help' });
    fireEvent.keyDown(document.body, { key: 'Tab' });
    act(() => trigger.focus());
    const tooltip = await screen.findByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });

  it('renders optional sections and reports visibility changes', async () => {
    const onOpenChange = vi.fn();
    render(
      <Tooltip
        closeDelay={0}
        content="Details"
        footer="Footer"
        header="Heading"
        onOpenChange={onOpenChange}
      >
        <button type="button">Help</button>
      </Tooltip>,
    );
    fireEvent.keyDown(document.body, { key: 'Tab' });
    act(() => screen.getByRole('button').focus());
    await screen.findByRole('tooltip');
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    act(() => screen.getByRole('button').blur());
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('opens on hover for content that neither forwards a ref nor is interactive', async () => {
    const consoleWarn = vi.spyOn(console, 'warn');
    const consoleError = vi.spyOn(console, 'error');
    render(
      <Tooltip closeDelay={0} content="Details">
        <Chip>Retired</Chip>
      </Tooltip>,
    );

    // hover only opens tooltips after pointer input, earlier tests used the keyboard
    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    await userEvent.hover(screen.getByText('Retired'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Details');
    // no Focusable ref or interactive role warnings
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('Tooltip trigger selection', () => {
  it('connects interactive elements and ref forwarding components directly', () => {
    expect(isFocusableTrigger(<button type="button">Help</button>)).toBe(true);
    expect(isFocusableTrigger(<a href="/docs">Docs</a>)).toBe(true);
    expect(isFocusableTrigger(<span role="button">Help</span>)).toBe(true);
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable by tabIndex is the case under test
    expect(isFocusableTrigger(<span tabIndex={0}>Help</span>)).toBe(true);
    expect(isFocusableTrigger(<RefButton>Help</RefButton>)).toBe(true);
    const MemoButton = memo(RefButton);
    expect(isFocusableTrigger(<MemoButton>Help</MemoButton>)).toBe(true);
  });

  it('wraps non-interactive elements and components without ref forwarding', () => {
    expect(isFocusableTrigger(<span>Info</span>)).toBe(false);
    expect(isFocusableTrigger(<span tabIndex={-1}>Info</span>)).toBe(false);
    expect(isFocusableTrigger(<Chip>Info</Chip>)).toBe(false);
  });
});
