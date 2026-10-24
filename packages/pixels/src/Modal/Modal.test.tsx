import { describe, expect, test, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import Modal from './Modal';
import * as interactionStories from './stories/Modal.interactions.stories';
import * as stories from './stories/Modal.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
  storySnapshots(interactionStories);
});

describe('Coverage', () => {
  test('should render with no children', () => {
    const { container } = render(<Modal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('Should have correct testIds', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} testId="modal1" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should render with only header', () => {
    const { container } = render(
      <Modal
        footer="id"
        header={<div>test</div>}
        isOpen={false}
        onClose={() => {}}
        testId="testId"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should render header, body, and footer when provided', () => {
    render(
      <Modal
        // eslint-disable-next-line react/no-children-prop
        children={<div data-testid="modal-body">Body Content</div>}
        footer={<div data-testid="modal-footer">Footer Content</div>}
        header={<div data-testid="modal-header">Header Content</div>}
        isOpen // Must be open to render content
        onClose={() => {}}
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
        header={<div data-testid="modal-header">Header Content</div>}
        isOpen
        onClose={() => {}}
      />,
    );

    expect(screen.getByTestId('modal-header')).toBeInTheDocument();

    // Check if body and footer are NOT in the document
    expect(screen.queryByTestId('modal-body')).not.toBeInTheDocument();
    expect(screen.queryByRole('footer')).not.toBeInTheDocument(); // or queryByTestId if you add a testId
  });
});

describe('Modal interactions', () => {
  test('requests closing when its backdrop is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        Details
      </Modal>,
    );
    const wrapper = screen.getByRole('dialog').closest('[data-slot="wrapper"]');
    if (!wrapper) {
      throw new Error('Missing modal wrapper');
    }

    await userEvent.click(wrapper);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('uses its header and unique body IDs for accessible associations', () => {
    render(
      <Modal header="Edit profile" isOpen onClose={() => {}}>
        Profile details
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    const description = dialog.getAttribute('aria-describedby');
    expect(description).toBeTruthy();
    expect(document.getElementById(description ?? '')).toHaveTextContent(
      'Profile details',
    );
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('requests closing without overriding controlled visibility', async () => {
    const onClose = vi.fn();
    render(
      <Modal header="Edit" isOpen onClose={onClose}>
        Details
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('contains focus and restores the opener after closing', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = render(
      <Modal isOpen onClose={() => {}}>
        <button type="button">Action</button>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    rerender(<Modal isOpen={false} onClose={() => {}} />);
    await waitFor(() => expect(opener).toHaveFocus());
    opener.remove();
  });

  test('renders in an Element portal and restores page scrolling on unmount', () => {
    const portal = document.createElement('aside');
    document.body.appendChild(portal);
    const previousOverflow = document.documentElement.style.overflow;
    const { unmount } = render(
      <Modal isOpen onClose={() => {}} portalContainer={portal} testId="custom">
        Portaled details
      </Modal>,
    );
    expect(within(portal).getByTestId('modal_custom')).toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe('hidden');
    unmount();
    expect(document.documentElement.style.overflow).toBe(previousOverflow);
    portal.remove();
  });

  test('only dismisses the top dialog in a stack', async () => {
    const onFirstClose = vi.fn();
    const onSecondClose = vi.fn();
    const { rerender } = render(
      <>
        <Modal header="First" isOpen onClose={onFirstClose}>
          First body
        </Modal>
        <Modal header="Second" isOpen={false} onClose={onSecondClose}>
          Second body
        </Modal>
      </>,
    );
    const firstDialog = screen.getByRole('dialog', { name: 'First' });

    rerender(
      <>
        <Modal header="First" isOpen onClose={onFirstClose}>
          First body
        </Modal>
        <Modal header="Second" isOpen onClose={onSecondClose}>
          Second body
        </Modal>
      </>,
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Second' })).toHaveFocus();
    });
    await userEvent.keyboard('{Escape}');
    expect(onFirstClose).not.toHaveBeenCalled();
    expect(onSecondClose).toHaveBeenCalledTimes(1);
    const dialogs = screen.getAllByRole('dialog', { hidden: true });
    expect(dialogs).toContain(firstDialog);
    expect(
      new Set(dialogs.map((dialog) => dialog.getAttribute('aria-describedby')))
        .size,
    ).toBe(2);
  });
});
