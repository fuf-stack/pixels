import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom/vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import { createStyling } from '@fuf-stack/pixel-utils';

import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import { StylingProvider } from '../StylingProvider';
import Popover from './Popover';
import * as edgeCaseStories from './stories/Popover.edge-cases.stories';
import * as interactionStories from './stories/Popover.interactions.stories';
import * as stories from './stories/Popover.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
  storySnapshots(edgeCaseStories);
});

describe('Popover interactions', () => {
  it('renders an empty trigger when children are omitted', () => {
    render(<Popover content="Details" />);

    expect(screen.getByRole('button')).toBeEmptyDOMElement();
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button')).toMatchSnapshot();
  });

  it('opens with the keyboard, names the dialog and restores focus on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        content={<input aria-label="Details" />}
        header="More information"
      >
        Open
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });

    await user.tab();
    await user.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog', { name: 'More information' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(dialog).toHaveFocus();
    expect(dialog).toMatchSnapshot();

    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Details' })).toHaveFocus();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('uses the trigger as the accessible name when there is no header', async () => {
    const user = userEvent.setup();
    render(<Popover content="Details">More information</Popover>);
    await user.click(screen.getByRole('button', { name: 'More information' }));

    expect(
      screen.getByRole('dialog', { name: 'More information' }),
    ).toBeInTheDocument();
  });

  it('dismisses on an outside press without blocking the outside action', async () => {
    const user = userEvent.setup();
    const outside = vi.fn();
    render(
      <>
        <Popover content="Details">Open</Popover>
        <button onClick={outside} type="button">
          Outside
        </button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(outside).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
    });
  });

  it('reports controlled changes without overriding the owner', async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();
    const { rerender } = render(
      <Popover content="Details" openControlled={{ open: false, setOpen }}>
        Open
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(setOpen).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Popover content="Details" openControlled={{ open: true, setOpen }}>
        Open
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(setOpen).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <Popover content="Details" openControlled={{ open: false, setOpen }}>
        Open
      </Popover>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses the supplied portal container and preserves test IDs', async () => {
    const user = userEvent.setup();
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    const { unmount } = render(
      <Popover
        content="Details"
        contentTestId="panel"
        portalContainer={portal}
        testId="trigger"
      >
        Open
      </Popover>,
    );

    await user.click(screen.getByTestId('trigger'));
    expect(within(portal).getByRole('dialog')).toBe(
      screen.getByTestId('panel'),
    );

    unmount();
    expect(portal).toBeEmptyDOMElement();
    portal.remove();
  });

  it.each([false, true])(
    'keeps scroll blocking independent of modality (%s)',
    async (shouldBlockScroll) => {
      const user = userEvent.setup();
      const initialOverflow = document.documentElement.style.overflow;
      const { unmount } = render(
        <>
          <Popover content="Details" shouldBlockScroll={shouldBlockScroll}>
            Open
          </Popover>
          <button type="button">Outside</button>
        </>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(document.documentElement.style.overflow).toBe(
        shouldBlockScroll ? 'hidden' : initialOverflow,
      );
      expect(
        screen.getByRole('button', { name: 'Outside' }),
      ).toBeInTheDocument();

      unmount();
      expect(document.documentElement.style.overflow).toBe(initialOverflow);
    },
  );

  it('supports styled triggers without submitting the surrounding form', async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={submit}>
        <Popover
          content="Details"
          triggerButtonProps={{
            'aria-label': 'Details',
            color: 'success',
            variant: 'shadow',
          }}
        >
          Open
        </Popover>
      </form>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });

    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
    expect(trigger).toHaveClass('text-success-foreground');
    expect(submit).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('does not open from a disabled styled trigger', async () => {
    const user = userEvent.setup();
    render(
      <Popover content="Details" triggerButtonProps={{ disabled: true }}>
        Open
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes only the inner popover on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        content={
          <Popover content="Inner content" header="Inner">
            Open inner
          </Popover>
        }
        header="Outer"
      >
        Open outer
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open outer' }));
    await user.click(screen.getByRole('button', { name: 'Open inner' }));
    expect(screen.getByRole('dialog', { name: 'Inner' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: 'Inner' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Outer' })).toBeInTheDocument();
  });

  it('dismisses when a non-focusable area is pressed', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Popover content="Details">Open</Popover>
        <div data-testid="outside">Outside area</div>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByTestId('outside'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isolates content buttons from the trigger press context', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(
      <Popover content={<Button onClick={action}>Action</Button>}>
        Open
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Action' }));

    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('keeps consumer merge rules available inside the portal', async () => {
    const user = userEvent.setup();
    const styling = createStyling({
      extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
    });
    render(
      <StylingProvider styling={styling}>
        <Popover
          className={{ content: 'text-body text-danger' }}
          content="Details"
        >
          Open
        </Popover>
      </StylingProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const content = screen
      .getByRole('dialog')
      .querySelector('[data-slot="content"]');

    expect(content).toHaveClass('text-body', 'text-danger');
    expect(content).not.toHaveClass('text-small');
  });

  it('keeps styled triggers independent of surrounding button groups', () => {
    render(
      <ButtonGroup fullWidth size="lg">
        <Popover content="Details" triggerButtonProps={{}}>
          Open
        </Popover>
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', { name: 'Open' })).not.toHaveClass(
      'w-full',
    );
    expect(screen.getByRole('button', { name: 'Open' })).toHaveClass('h-10');
  });
});
