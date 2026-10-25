import { describe, expect, test, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import Drawer from './Drawer';
import * as edgeCaseStories from './stories/Drawer.edge-cases.stories';
import * as interactionStories from './stories/Drawer.interactions.stories';
import * as stories from './stories/Drawer.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
  storySnapshots(edgeCaseStories);
});

describe('Drawer Component', () => {
  test('should render with no children', () => {
    const { container } = render(<Drawer />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('Should have correct testIds', () => {
    const { container } = render(<Drawer testId="drawer1" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should render with only header', () => {
    const { container } = render(
      <Drawer
        header={<div data-testid="drawer-header">test</div>}
        testId="drawerTestId"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should render header, body, and footer when provided', () => {
    render(
      <Drawer
        // eslint-disable-next-line react/no-children-prop
        children={<div data-testid="drawer-body">Body Content</div>}
        footer={<div data-testid="drawer-footer">Footer Content</div>}
        header={<div data-testid="drawer-header">Header Content</div>}
        isOpen // Must be open to render content
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId('drawer-header')).toHaveTextContent(
      'Header Content',
    );
    expect(screen.getByTestId('drawer-body')).toHaveTextContent('Body Content');
    expect(screen.getByTestId('drawer-footer')).toHaveTextContent(
      'Footer Content',
    );
  });

  test('should not render header, footer if not provided', () => {
    render(
      <Drawer isOpen onClose={() => {}}>
        <div data-testid="drawer-body">Body Content</div>
      </Drawer>,
    );
    // Check if header and footer are NOT in the document
    expect(screen.queryByRole('heading')).not.toBeInTheDocument(); // Assuming HeroDrawerHeader renders a heading
    expect(screen.queryByTestId('drawer-footer')).not.toBeInTheDocument();
    // Body should still be present
    expect(screen.getByTestId('drawer-body')).toHaveTextContent('Body Content');
  });

  test('should render only header if only header provided', () => {
    render(
      <Drawer
        header={<div data-testid="drawer-header">Header Content</div>}
        isOpen
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId('drawer-header')).toBeInTheDocument();
    // Check if body and footer are NOT in the document
    expect(screen.queryByTestId('drawer-body')).not.toBeInTheDocument();
    expect(screen.queryByRole('footer')).not.toBeInTheDocument();
  });
});

describe('Drawer interactions', () => {
  test('keeps controlled visibility and notifies both close callbacks', async () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Drawer
        header="Details"
        isOpen
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        Body
      </Drawer>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
  });

  test('keeps Escape available when backdrop dismissal and the visible close button are disabled', async () => {
    const onClose = vi.fn();
    render(
      <Drawer hideCloseButton isDismissable={false} isOpen onClose={onClose}>
        Body
      </Drawer>,
    );
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
    const wrapper = document.querySelector('[data-slot="wrapper"]');
    if (!wrapper) {
      throw new Error('Missing drawer wrapper');
    }
    await userEvent.click(wrapper);
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('supports a custom close button without nesting another button', async () => {
    const onClose = vi.fn();
    const onCustomClick = vi.fn();
    render(
      <Drawer
        closeButton={
          <button onClick={onCustomClick} type="button">
            Done
          </button>
        }
        isOpen
        onClose={onClose}
      >
        Body
      </Drawer>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.querySelector('button button')).not.toBeInTheDocument();
    expect(screen.getByText('Done')).toBeVisible();
    expect(onCustomClick).toHaveBeenCalledTimes(1);
  });

  test.each(['left', 'right', 'top', 'bottom'] as const)(
    'applies %s placement to the dialog',
    (placement) => {
      render(
        <Drawer header="Details" isOpen placement={placement}>
          Body
        </Drawer>,
      );
      expect(screen.getByRole('dialog')).toHaveAttribute(
        'data-placement',
        placement,
      );
    },
  );

  test('renders in a custom Element portal with the existing test ID', () => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    const { unmount } = render(
      <Drawer isOpen portalContainer={portal} testId="custom">
        Body
      </Drawer>,
    );
    expect(within(portal).getByTestId('drawer_custom')).toBeInTheDocument();
    unmount();
    portal.remove();
  });
});
