import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, within } from '@testing-library/react';

import Menu from './Menu';
import * as stories from './Menu.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Coverage', () => {
  test('renders Menu items correctly', () => {
    const { container, getByText } = render(
      <Menu items={[{ label: 'testItem', key: 'testitem' }]} />,
    );

    // Click the button
    fireEvent.click(container.firstChild);

    // Check if the error is shown
    const items = getByText('testItem');
    expect(items).toBeInTheDocument();
  });

  test('renders Menu items of item correctly', () => {
    const { container, getByText } = render(
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
    fireEvent.click(container.firstChild);

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

    const { container } = render(
      <Menu
        items={[{ label: 'portaled item', key: 'portaled' }]}
        portalContainer={portal}
      />,
    );

    fireEvent.click(container.firstChild as ChildNode);

    // The menu item should be rendered inside the provided portal container.
    expect(within(portal).getByText('portaled item')).toBeInTheDocument();

    portal.remove();
  });

  test('forwards textValue for non-plain-text labels', () => {
    const { container, getByRole } = render(
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
    fireEvent.click(container.firstChild);

    // textValue becomes the item's accessible name for type-to-select
    const item = getByRole('menuitem', { name: 'Rich label' });
    expect(item).toBeInTheDocument();
  });
});
