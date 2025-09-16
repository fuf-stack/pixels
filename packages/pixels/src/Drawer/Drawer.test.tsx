import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import Drawer from './Drawer';
import * as stories from './Drawer.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
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
        isOpen // Must be open to render content
        footer={<div data-testid="drawer-footer">Footer Content</div>}
        onClose={() => {}}
        header={<div data-testid="drawer-header">Header Content</div>}
        // eslint-disable-next-line react/no-children-prop
        children={<div data-testid="drawer-body">Body Content</div>}
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
        isOpen
        header={<div data-testid="drawer-header">Header Content</div>}
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId('drawer-header')).toBeInTheDocument();
    // Check if body and footer are NOT in the document
    expect(screen.queryByTestId('drawer-body')).not.toBeInTheDocument();
    expect(screen.queryByRole('footer')).not.toBeInTheDocument();
  });
});
