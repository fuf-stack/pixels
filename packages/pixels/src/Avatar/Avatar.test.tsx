import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen } from '@testing-library/react';

import Avatar from './Avatar';
import * as edgeCases from './stories/Avatar.edge-cases.stories';
import * as stories from './stories/Avatar.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases });
});

// -----------------------------------------------------------------------------
// Image and fallback behavior
// -----------------------------------------------------------------------------
describe('Image and fallback behavior', () => {
  it('shows the placeholder without adding a keyboard stop', () => {
    render(<Avatar src="" />);

    const placeholder = screen.getByRole('img', { name: 'avatar' });
    expect(placeholder.parentElement).toHaveAttribute('tabindex', '-1');
  });

  it('replaces a custom fallback after loading and restores it on failure', () => {
    render(<Avatar fallback="JD" src="/avatar.png" />);
    const image = screen.getByAltText('avatar');

    expect(screen.getByText('JD')).toBeInTheDocument();
    fireEvent.load(image);
    expect(image).toHaveAttribute('data-loaded', 'true');
    expect(screen.queryByText('JD')).not.toBeInTheDocument();

    fireEvent.error(image);
    expect(image).not.toHaveAttribute('data-loaded');
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('resets loading for a new source without accepting stale image events', () => {
    const { rerender } = render(<Avatar fallback="JD" src="/first.png" />);
    const previousImage = screen.getByAltText('avatar');
    fireEvent.load(previousImage);

    rerender(<Avatar fallback="JD" src="/second.png" />);
    const image = screen.getByAltText('avatar');
    fireEvent.load(previousImage);

    expect(image).not.toHaveAttribute('data-loaded');
    expect(screen.getByText('JD')).toBeInTheDocument();
    fireEvent.load(image);
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('keeps image-only failures empty when no fallback is supplied', () => {
    const { container } = render(<Avatar src="/broken.png" />);
    fireEvent.error(screen.getByAltText('avatar'));

    expect(
      container.querySelector('[data-slot="icon"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="fallback"]'),
    ).not.toBeInTheDocument();
  });

  it('merges custom slots with border, disabled and size styles', () => {
    const { container } = render(
      <Avatar
        bordered
        className={{ base: 'h-20', fallback: 'text-danger' }}
        disabled
        fallback="JD"
        size="lg"
        src=""
      />,
    );

    expect(container.firstChild).toHaveClass(
      'h-20',
      'w-14',
      'ring-2',
      'opacity-disabled',
    );
    expect(container.firstChild).not.toHaveClass('h-14');
    expect(screen.getByText('JD')).toHaveClass('text-danger');
  });
});
