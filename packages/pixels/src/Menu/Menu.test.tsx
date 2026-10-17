import { describe, expect, test, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { userEvent } from 'storybook/test';

import Menu from './Menu';
import * as interactionStories from './stories/Menu.interactions.stories';
import * as stories from './stories/Menu.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
});

describe('Coverage', () => {
  test('renders Menu items correctly', () => {
    const { getByText } = render(
      <Menu items={[{ label: 'testItem', key: 'testitem' }]} />,
    );

    // Click the button
    fireEvent.click(screen.getByRole('button'));

    // Check if the error is shown
    const items = getByText('testItem');
    expect(items).toBeInTheDocument();
  });

  test('renders Menu items of item correctly', () => {
    const { getByText } = render(
      <Menu
        items={[
          { label: 'firstItem', key: 'firstitem' },
          {
            label: 'SubMenu',
            key: 'submenu',
            items: [{ label: 'subItem', key: 'subitem' }],
          },
        ]}
      />,
    );

    // Click the button
    fireEvent.click(screen.getByRole('button'));

    const firstItem = getByText('firstItem');
    expect(firstItem).toBeInTheDocument();

    const subMenu = getByText('SubMenu');
    expect(subMenu).toBeInTheDocument();

    const subItem = getByText('subItem');
    expect(subItem).toBeInTheDocument();
  });

  test('renders the menu popover into a custom portal container', () => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);

    render(
      <Menu
        items={[{ label: 'portaled item', key: 'portaled' }]}
        portalContainer={portal}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    // The menu item should be rendered inside the provided portal container.
    expect(within(portal).getByText('portaled item')).toBeInTheDocument();

    portal.remove();
  });

  test('forwards textValue for non-plain-text labels', () => {
    const { getByRole } = render(
      <Menu
        items={[
          {
            key: 'jsx-label',
            label: <span>Rich label</span>,
            textValue: 'Rich label',
          },
        ]}
      />,
    );

    // Open the menu
    fireEvent.click(screen.getByRole('button'));

    // textValue becomes the item's accessible name for type-to-select
    const item = getByRole('menuitem', { name: 'Rich label' });
    expect(item).toBeInTheDocument();
  });
});

describe('Menu interactions', () => {
  test('supports keyboard navigation, skips disabled items and reports an action once', async () => {
    const onAction = vi.fn();
    const onClick = vi.fn();
    render(
      <Menu
        disableAnimation
        items={[
          { key: 'first', label: 'First' },
          { key: 'disabled', label: 'Disabled', disabled: true },
          { key: 'last', label: 'Last', onClick },
        ]}
        onAction={onAction}
      >
        Actions
      </Menu>,
    );
    screen.getByRole('button', { name: 'Actions' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenCalledExactlyOnceWith('last');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].pointerType).toBe('keyboard');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  test('closes on Escape and restores focus to the trigger', async () => {
    render(
      <Menu disableAnimation items={[{ key: 'one', label: 'One' }]}>
        Actions
      </Menu>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test('keeps disabled triggers closed and styled triggers out of form submission', async () => {
    const submit = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    const { rerender } = render(
      <Menu isDisabled items={[]}>
        Actions
      </Menu>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    rerender(
      <form onSubmit={submit}>
        <Menu
          disableAnimation
          items={[{ key: 'one', label: 'One' }]}
          triggerButtonProps={{ color: 'primary' }}
        >
          Actions
        </Menu>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  test('allows outside controls to receive the dismissing press and focus', async () => {
    const outside = vi.fn();
    render(
      <>
        <button onClick={outside} type="button">
          Outside
        </button>
        <Menu disableAnimation items={[{ key: 'one', label: 'One' }]}>
          Actions
        </Menu>
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(outside).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  });
});
