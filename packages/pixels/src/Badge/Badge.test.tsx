import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import Badge from './Badge';
import * as edgeCases from './stories/Badge.edge-cases.stories';
import * as interactions from './stories/Badge.interactions.stories';
import * as stories from './stories/Badge.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Badge behavior', () => {
  it('returns children directly when content is undefined', () => {
    const { container } = render(
      <Badge>
        <button type="button">Messages</button>
      </Badge>,
    );

    expect(container.firstChild).toBe(
      screen.getByRole('button', { name: 'Messages' }),
    );
  });

  it('keeps numeric zero visible and sizes it as a single character', () => {
    render(
      <Badge content={0}>
        <span>Messages</span>
      </Badge>,
    );

    expect(screen.getByText('0')).toHaveClass('h-5', 'w-5', 'px-0');
  });

  it('treats an empty string as a dot while keeping null as empty badge content', () => {
    const { container, rerender } = render(
      <Badge content="">
        <span>Messages</span>
      </Badge>,
    );

    expect(container.querySelector('[data-slot="badge"]')).toHaveClass(
      'h-3.5',
      'w-3.5',
    );

    rerender(
      <Badge content={null}>
        <span>Messages</span>
      </Badge>,
    );
    expect(
      container.querySelector('[data-slot="badge"]'),
    ).toBeEmptyDOMElement();
    expect(container.querySelector('[data-slot="badge"]')).not.toHaveClass(
      'w-3.5',
    );
  });

  it('supports rich content and consumer slot overrides', () => {
    const { container } = render(
      <Badge
        className={{ badge: 'bg-danger text-large', base: 'inline-block' }}
        content={<strong>New</strong>}
        noOutline
        placement="bottom-left"
      >
        <span>Messages</span>
      </Badge>,
    );

    expect(screen.getByText('New').parentElement).toHaveClass(
      'bg-danger',
      'text-large',
      'border-0',
      'bottom-[5%]',
      'left-[5%]',
    );
    expect(container.firstChild).toHaveClass('inline-block');
    expect(container.firstChild).not.toHaveClass('inline-flex');
  });

  it('uses the requested circle size when content has several characters', () => {
    render(
      <Badge content="99" isOneChar size="lg">
        <span>Messages</span>
      </Badge>,
    );

    expect(screen.getByText('99')).toHaveClass('h-6', 'w-6', 'px-0');
  });
});
