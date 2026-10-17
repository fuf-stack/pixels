import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import Label from './Label';
import * as interactions from './stories/Label.interactions.stories';
import * as stories from './stories/Label.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...interactions });
});

describe('Label behavior', () => {
  it('renders text and icons inside the content slot', () => {
    const { container } = render(
      <Label icon={<svg aria-label="Rocket" />}>Active</Label>,
    );

    expect(screen.getByText('Active')).toHaveAttribute('data-slot', 'content');
    expect(screen.getByLabelText('Rocket').parentElement).toHaveAttribute(
      'data-slot',
      'icon',
    );
    expect(
      container.querySelector('[data-slot="dot"]'),
    ).not.toBeInTheDocument();
  });

  it('uses the dot slot for status treatments and preserves info color', () => {
    const { container } = render(
      <Label color="info" variant="dot">
        Active
      </Label>,
    );

    expect(container.querySelector('[data-slot="dot"]')).toHaveClass('bg-info');
    expect(container.firstChild).toHaveClass('border-medium', 'bg-transparent');
  });

  it('retains trailing element classes when constraining its height', () => {
    render(
      <Label
        endContent={<svg aria-label="Trailing icon" className="text-danger" />}
      >
        Active
      </Label>,
    );

    expect(screen.getByLabelText('Trailing icon')).toHaveClass(
      'text-danger',
      'max-h-[80%]',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls the close callback without removing the label', async () => {
    const onClose = vi.fn();
    render(<Label onClose={onClose}>Active</Label>);

    await userEvent.click(screen.getByRole('button', { name: 'close chip' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose.mock.calls[0][0]).toMatchObject({ type: 'press' });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('does not submit an enclosing form when closing', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <Label onClose={onClose}>Active</Label>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'close chip' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('uses trailing content inside the close action without nesting controls', () => {
    render(
      <Label endContent={<svg aria-label="Remove" />} onClose={vi.fn()}>
        Active
      </Label>,
    );

    const button = screen.getByRole('button', { name: 'close chip' });
    expect(button).toContainElement(screen.getByLabelText('Remove'));
    expect(button.querySelector('button')).not.toBeInTheDocument();
  });

  it('merges custom slots with the requested size, radius and color', () => {
    const { container } = render(
      <Label
        className={{
          base: 'h-12',
          content: 'text-large',
          closeButton: 'text-danger',
        }}
        color="success"
        onClose={vi.fn()}
        radius="sm"
        size="lg"
      >
        Active
      </Label>,
    );

    expect(container.firstChild).toHaveClass(
      'h-12',
      'rounded-small',
      'bg-success',
    );
    expect(container.firstChild).not.toHaveClass('h-8');
    expect(screen.getByText('Active')).toHaveClass('text-large');
    expect(screen.getByRole('button')).toHaveClass('text-danger');
  });
});

describe('Layout details', () => {
  it('retains icon-only padding and the faded info background', () => {
    const { container, rerender } = render(<Label icon={<svg />} size="lg" />);
    expect(container.querySelector('[data-slot="content"]')).toHaveClass(
      'px-1',
    );

    rerender(
      <Label color="info" variant="faded">
        Active
      </Label>,
    );
    expect(container.firstChild).toHaveClass('bg-default-100', 'text-info');
  });
});
