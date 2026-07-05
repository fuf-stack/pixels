/* eslint-disable react-hooks/rules-of-hooks */

import type { Meta, StoryObj } from '@storybook/react-vite';

import { useMemo, useState } from 'react';

import VirtualList from './VirtualList';

// Animations/latency are disabled in the test environment for stable snapshots.
const isTestEnv = process.env.NODE_ENV === 'test';

const TOTAL_SERVER_ITEMS = 200;
const PAGE_SIZE = 25;

const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, index) => {
    return `List item ${index + 1}`;
  });
};

const serverItems = generateItems(TOTAL_SERVER_ITEMS);

/** Simulates async cursor-based page loading against a fixed server dataset. */
const useSimulatedItemConnection = () => {
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const data = useMemo(() => {
    return serverItems.slice(0, loadedCount);
  }, [loadedCount]);

  const onLoadMore = () => {
    setIsFetchingNextPage(true);
    setTimeout(
      () => {
        setLoadedCount((currentCount) => {
          return Math.min(currentCount + PAGE_SIZE, serverItems.length);
        });
        setIsFetchingNextPage(false);
      },
      isTestEnv ? 0 : 600,
    );
  };

  return {
    data,
    isFetchingNextPage,
    onLoadMore,
    pageInfo: {
      endCursor: String(loadedCount),
      hasNextPage: loadedCount < serverItems.length,
      totalCount: serverItems.length,
    },
  };
};

const StringVirtualList = VirtualList<string>;

const meta: Meta<typeof StringVirtualList> = {
  title: 'Megapixels/VirtualList',
  component: StringVirtualList,
};

export default meta;
type Story = StoryObj<typeof StringVirtualList>;

export const Default: Story = {
  render: () => {
    return (
      <VirtualList
        data={serverItems}
        renderItem={(item) => {
          return <div>{item}</div>;
        }}
        virtualization={{ maxHeight: 300 }}
      />
    );
  },
};

export const InfiniteScrollLoadedCount: Story = {
  render: () => {
    const { data, isFetchingNextPage, onLoadMore, pageInfo } =
      useSimulatedItemConnection();

    return (
      <VirtualList
        data={data}
        infiniteScroll={{
          isFetchingNextPage,
          onLoadMore,
          pageInfo,
          scrollbarMode: 'loaded-count',
        }}
        renderItem={(item) => {
          return <div>{item}</div>;
        }}
        virtualization={{ maxHeight: 300 }}
      />
    );
  },
};

export const InfiniteScrollTotalCount: Story = {
  render: () => {
    const { data, isFetchingNextPage, onLoadMore, pageInfo } =
      useSimulatedItemConnection();

    return (
      <VirtualList
        data={data}
        infiniteScroll={{
          isFetchingNextPage,
          onLoadMore,
          pageInfo,
          scrollbarMode: 'total-count',
        }}
        renderItem={(item) => {
          return <div>{item}</div>;
        }}
        virtualization={{ maxHeight: 300 }}
      />
    );
  },
};

export const InfiniteScrollLoadError: Story = {
  render: () => {
    const serverDataset = useMemo(() => {
      return generateItems(60);
    }, []);
    const pageSize = 20;
    const [loadedCount, setLoadedCount] = useState(pageSize);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const [failed, setFailed] = useState(true);
    const data = useMemo(() => {
      return serverDataset.slice(0, loadedCount);
    }, [loadedCount, serverDataset]);

    return (
      <VirtualList
        data={data}
        infiniteScroll={{
          isFetchingNextPage,
          loadMoreError: failed,
          onLoadMore: () => {
            if (isFetchingNextPage) {
              return;
            }
            setFailed(false);
            setIsFetchingNextPage(true);
            setTimeout(
              () => {
                setLoadedCount((currentCount) => {
                  return Math.min(
                    currentCount + pageSize,
                    serverDataset.length,
                  );
                });
                setIsFetchingNextPage(false);
              },
              isTestEnv ? 0 : 600,
            );
          },
          pageInfo: {
            endCursor: String(loadedCount),
            hasNextPage: loadedCount < serverDataset.length,
            totalCount: serverDataset.length,
          },
          retryContent: 'Retry next page',
        }}
        renderItem={(item) => {
          return <div>{item}</div>;
        }}
        virtualization={{ maxHeight: 300 }}
      />
    );
  },
};

export const DynamicItemHeights: Story = {
  render: () => {
    const items = useMemo(() => {
      return Array.from({ length: 300 }, (_, index) => {
        const repeat = (index % 5) + 1;
        return `Item ${index + 1} — ${'variable height content. '.repeat(repeat)}`;
      });
    }, []);

    return (
      <VirtualList
        data={items}
        renderItem={(item) => {
          return <div>{item}</div>;
        }}
        virtualization={{ dynamicRowHeight: true, maxHeight: 300 }}
      />
    );
  },
};
