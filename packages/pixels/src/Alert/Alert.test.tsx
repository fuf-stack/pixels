import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen } from '@testing-library/react';

import Alert from './Alert';
import * as edgeCases from './stories/Alert.edge-cases.stories';
import * as interactions from './stories/Alert.interactions.stories';
import * as stories from './stories/Alert.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Alert behavior', () => {
  it('announces its title and supporting message with the supplied test ID', () => {
    render(
      <Alert testId="status" title="Saved">
        Changes stored
      </Alert>,
    );

    expect(screen.getByRole('alert')).toHaveAttribute('data-testid', 'status');
    expect(screen.getByRole('alert')).toHaveTextContent('SavedChanges stored');
  });

  it('dismisses once and calls its owner without submitting a form', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <Alert closable onClose={onClose}>
          Message
        </Alert>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps onClose-only dismissal supported', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Message</Alert>);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps numeric zero as supporting content and omits empty messages', () => {
    const { container, rerender } = render(<Alert>{0}</Alert>);
    expect(screen.getByText('0')).toHaveAttribute('data-slot', 'description');

    rerender(<Alert>{[]}</Alert>);
    expect(
      container.querySelector('[data-slot="description"]'),
    ).not.toBeInTheDocument();
  });

  it('styles custom icons and trailing content through their public slots', () => {
    render(
      <Alert
        className={{ endContent: 'text-danger', icon: 'w-8' }}
        endContent={<span>Action</span>}
        icon={<svg aria-label="Custom icon" />}
      >
        Message
      </Alert>,
    );

    expect(screen.getByLabelText('Custom icon')).toHaveClass('w-8');
    expect(screen.getByLabelText('Custom icon')).not.toHaveClass('w-6');
    expect(screen.getByText('Action').parentElement).toHaveClass('text-danger');
  });

  it('does not show a dismiss action without either close option', () => {
    render(<Alert>Message</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
