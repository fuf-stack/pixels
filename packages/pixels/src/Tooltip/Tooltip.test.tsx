import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import * as interactionStories from './stories/Tooltip.interactions.stories';
import * as stories from './stories/Tooltip.stories';
import Tooltip from './Tooltip';

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
});
