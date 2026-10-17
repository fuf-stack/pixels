import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen, within } from '@testing-library/react';

import AvatarGroup from './AvatarGroup';
import * as edgeCases from './stories/AvatarGroup.edge-cases.stories';
import * as interactions from './stories/AvatarGroup.interactions.stories';
import * as stories from './stories/AvatarGroup.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Group behavior', () => {
  const avatars = ['A', 'B', 'C', 'D'].map((fallback) => ({
    fallback,
    src: '',
  }));

  it('limits visible entries and announces the hidden count', () => {
    render(<AvatarGroup avatars={avatars} max={2} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '+2' })).toHaveTextContent('+');
  });

  it('displays every entry when max is zero, without an overflow indicator', () => {
    render(<AvatarGroup avatars={avatars} max={0} />);

    expect(within(screen.getByRole('group')).getAllByRole('img')).toHaveLength(
      4,
    );
    expect(screen.queryByRole('img', { name: /^\+/ })).not.toBeInTheDocument();
  });

  it('supports empty groups and limits above the entry count', () => {
    const { rerender } = render(<AvatarGroup />);
    expect(screen.getByRole('group')).toBeEmptyDOMElement();

    rerender(<AvatarGroup avatars={avatars} max={10} />);
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.queryByRole('img', { name: /^\+/ })).not.toBeInTheDocument();
  });

  it('preserves wrapper props and each avatar’s custom slots', () => {
    const onClick = vi.fn();
    render(
      <AvatarGroup
        avatarWrapper="button"
        avatars={[
          {
            src: '',
            fallback: 'A',
            className: { fallback: 'text-danger' },
            wrapperProps: {
              'aria-label': 'Open profile',
              onClick,
              type: 'button',
            },
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open profile' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByText('A')).toHaveClass('text-danger');
  });

  it('combines group defaults with per-avatar disabled appearance', () => {
    const { container, rerender } = render(
      <AvatarGroup
        avatars={[
          ...avatars.slice(0, 1),
          { src: '', fallback: 'B', disabled: true },
        ]}
        bordered
        rounded="sm"
        size="lg"
      />,
    );

    expect(screen.getByText('A').parentElement).toHaveClass(
      'ring-2',
      'rounded-small',
      'w-14',
    );
    expect(screen.getByText('A').parentElement).not.toHaveClass(
      'opacity-disabled',
    );
    expect(screen.getByText('B').parentElement).toHaveClass('opacity-disabled');

    rerender(<AvatarGroup avatars={avatars} disabled max={1} />);
    expect(container.querySelector('[data-slot="count"]')).toHaveClass(
      'opacity-disabled',
    );
    expect(screen.getByText('A').parentElement).toHaveClass('opacity-disabled');
  });
});
