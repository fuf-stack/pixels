import { describe, expect, it } from 'vitest';

import { createRef } from 'react';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { act, render, screen } from '@testing-library/react';

import Card from './Card';
import * as edgeCases from './stories/Card.edge-cases.stories';
import * as interactions from './stories/Card.interactions.stories';
import * as stories from './stories/Card.stories';

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Card behavior', () => {
  it('forwards its ref and preserves section test IDs', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} footer="Footer" header="Heading" testId="project">
        Details
      </Card>,
    );

    expect(ref.current).toBe(screen.getByTestId('card_project'));
    expect(screen.getByTestId('card_header_project')).toHaveTextContent(
      'Heading',
    );
    expect(screen.getByTestId('card_body_project')).toHaveTextContent(
      'Details',
    );
    expect(screen.getByTestId('card_footer_project')).toHaveTextContent(
      'Footer',
    );
    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });

  it('only inserts a divider for a present header or footer', () => {
    const { rerender } = render(<Card>Details</Card>);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();

    rerender(<Card header="Heading">Details</Card>);
    expect(screen.getAllByRole('separator')).toHaveLength(1);

    rerender(<Card footer="Footer">Details</Card>);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('keeps an empty body and renders numeric zero content', () => {
    const { rerender } = render(<Card testId="empty" />);
    expect(screen.getByTestId('card_body_empty')).toBeEmptyDOMElement();

    rerender(<Card testId="empty">{0}</Card>);
    expect(screen.getByTestId('card_body_empty')).toHaveTextContent('0');
  });

  it('supports programmatic focus without adding a tab stop', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} testId="focus">
        Details
      </Card>,
    );
    act(() => {
      ref.current?.focus();
    });

    expect(ref.current).toHaveFocus();
    expect(ref.current).toHaveAttribute('tabindex', '-1');
  });

  it('merges public slot overrides without removing unrelated defaults', () => {
    render(
      <Card
        className={{
          base: 'bg-danger',
          body: 'p-6',
          divider: 'bg-success',
          header: 'text-lg',
        }}
        footer="Footer"
        header="Heading"
        testId="styled"
      >
        Details
      </Card>,
    );

    expect(screen.getByTestId('card_styled')).toHaveClass(
      'bg-danger',
      'border',
    );
    expect(screen.getByTestId('card_styled')).not.toHaveClass('bg-content1');
    expect(screen.getByTestId('card_body_styled')).toHaveClass('p-6');
    expect(screen.getByTestId('card_body_styled')).not.toHaveClass('p-3');
    expect(screen.getByTestId('card_header_styled')).toHaveClass('text-lg');
    screen.getAllByRole('separator').forEach((divider) => {
      expect(divider).toHaveClass('bg-success');
    });
  });
});
