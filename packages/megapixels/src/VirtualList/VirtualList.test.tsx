import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import VirtualList from './VirtualList';

const data = Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`);

describe('VirtualList', () => {
  it('renders items with virtualization enabled', () => {
    render(
      <VirtualList
        data={data}
        renderItem={(item) => <div>{item}</div>}
        virtualization={{ maxHeight: 300 }}
      />,
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('shows retry control on load-more error', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();

    render(
      <VirtualList
        data={['Only loaded item']}
        infiniteScroll={{
          loadMoreError: true,
          onLoadMore,
          pageInfo: {
            endCursor: 'cursor',
            hasNextPage: true,
            totalCount: 2,
          },
          retryContent: 'Retry next page',
        }}
        renderItem={(item) => <div>{item}</div>}
        virtualization={{ maxHeight: 300 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Retry next page' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
