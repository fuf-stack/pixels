import { describe, expect, test } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import Modal from './Modal';
import * as stories from './Modal.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Coverage', () => {
  test('should render with no children', () => {
    const { container } = render(<Modal />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('Should have correct testIds', () => {
    const { container } = render(<Modal testId="modal1" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should render with only header', () => {
    const { container } = render(
      <Modal header={<div>test</div>} footer="id" testId="testId" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should render header, body, and footer when provided', () => {
    render(
      <Modal
        isOpen // Must be open to render content
        onClose={() => {}}
        header={<div data-testid="modal-header">Header Content</div>}
        // eslint-disable-next-line react/no-children-prop
        children={<div data-testid="modal-body">Body Content</div>}
        footer={<div data-testid="modal-footer">Footer Content</div>}
      />,
    );

    expect(screen.getByTestId('modal-header')).toHaveTextContent(
      'Header Content',
    );
    expect(screen.getByTestId('modal-body')).toHaveTextContent('Body Content');
    expect(screen.getByTestId('modal-footer')).toHaveTextContent(
      'Footer Content',
    );
  });

  test('should not render header, footer if not provided', () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <div data-testid="modal-body">Body Content</div>
      </Modal>,
    );

    // Check if header and footer are NOT in the document
    expect(screen.queryByRole('heading')).not.toBeInTheDocument(); // Assuming HeroModalHeader renders a heading
    expect(screen.queryByTestId('modal-footer')).not.toBeInTheDocument();

    // Body should still be present
    expect(screen.getByTestId('modal-body')).toHaveTextContent('Body Content');
  });

  test('should render only header if only header provided', () => {
    render(
      <Modal
        isOpen
        onClose={() => {}}
        header={<div data-testid="modal-header">Header Content</div>}
      />,
    );

    expect(screen.getByTestId('modal-header')).toBeInTheDocument();

    // Check if body and footer are NOT in the document
    expect(screen.queryByTestId('modal-body')).not.toBeInTheDocument();
    expect(screen.queryByRole('footer')).not.toBeInTheDocument(); // or queryByTestId if you add a testId
  });
});
