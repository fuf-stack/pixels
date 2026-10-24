import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen } from '@testing-library/react';

import Breadcrumb from './Breadcrumb';
import * as edgeCases from './stories/Breadcrumb.edge-cases.stories';
import * as interactions from './stories/Breadcrumb.interactions.stories';
import * as stories from './stories/Breadcrumb.stories';

const breadcrumbItems = ['Home', 'Music', 'Artist', 'Album', 'Song'].map(
  (children) => ({ children }),
);

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Breadcrumb behavior', () => {
  it('names the navigation landmark and identifies the current page', () => {
    render(<Breadcrumb breadcrumbItems={breadcrumbItems} />);

    expect(
      screen.getByRole('navigation', { name: 'Breadcrumbs' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Song')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Song')).not.toHaveAttribute('tabindex');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'tabindex',
      '0',
    );
  });

  it('retains the first and last two items when the middle collapses', () => {
    render(<Breadcrumb breadcrumbItems={breadcrumbItems} maxItems={3} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByLabelText('Collapsed breadcrumbs')).toBeInTheDocument();
    expect(screen.queryByText('Music')).not.toBeInTheDocument();
    expect(screen.queryByText('Artist')).not.toBeInTheDocument();
    expect(screen.getByText('Album')).toBeInTheDocument();
    expect(screen.getByText('Song')).toHaveAttribute('aria-current', 'page');
  });

  it('does not collapse three or fewer items', () => {
    render(
      <Breadcrumb breadcrumbItems={breadcrumbItems.slice(0, 3)} maxItems={1} />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.queryByLabelText('Collapsed breadcrumbs'),
    ).not.toBeInTheDocument();
  });

  it('disables individual items and supports disabling the entire path', () => {
    const { rerender } = render(
      <Breadcrumb
        breadcrumbItems={[
          { children: 'Home', disabled: true },
          { children: 'Current' },
        ]}
      />,
    );
    expect(screen.getByText('Home')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Home')).not.toHaveAttribute('tabindex');

    rerender(<Breadcrumb breadcrumbItems={breadcrumbItems} disabled />);
    screen.getAllByRole('link').forEach((item) => {
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(item).not.toHaveAttribute('tabindex');
    });
  });

  it('supports hidden, null and numeric separators', () => {
    const { container, rerender } = render(
      <Breadcrumb
        breadcrumbItems={breadcrumbItems.slice(0, 2)}
        separator={0}
      />,
    );
    expect(
      container.querySelector('[data-slot="separator"]'),
    ).toHaveTextContent('0');

    rerender(<Breadcrumb breadcrumbItems={breadcrumbItems} separator={null} />);
    expect(
      container.querySelector('[data-slot="separator"]'),
    ).toBeEmptyDOMElement();

    rerender(<Breadcrumb breadcrumbItems={breadcrumbItems} hideSeparator />);
    expect(
      container.querySelector('[data-slot="separator"]'),
    ).not.toBeInTheDocument();
  });

  it('styles every slot including the collapsed indicator', () => {
    const { container } = render(
      <Breadcrumb
        breadcrumbItems={breadcrumbItems}
        className={{
          ellipsis: 'text-danger',
          item: 'text-lg text-danger',
          nav: 'p-4',
        }}
        maxItems={3}
      />,
    );
    expect(screen.getByRole('navigation')).toHaveClass('p-4');
    expect(screen.getByText('Home')).toHaveClass('text-lg');
    expect(screen.getByText('Home')).not.toHaveClass('text-small');
    expect(screen.getByText('Song')).toHaveClass('text-danger');
    expect(screen.getByText('Song')).not.toHaveClass('text-foreground');
    expect(container.querySelector('[data-slot="ellipsis"]')).toHaveClass(
      'text-danger',
    );
  });
});
