import type { RefObject } from 'react';
import type { AriaTableProps } from 'react-aria';
import type { TableState } from 'react-stately';
import type { TableRowProps } from '../Table';

import { useLayoutEffect, useMemo, useState } from 'react';

interface TableVirtualizerOptions {
  /** Enables a bounded row window */
  enabled: boolean;
  /** Ref to the column-heading group */
  headerRef: RefObject<HTMLTableSectionElement | null>;
  /** Height used before the scroll surface can be measured */
  maxTableHeight: number;
  /** Fixed height of each rendered data row */
  rowHeight: number;
  /** Ref to the scrolling surface */
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Full collection and current keyboard focus */
  state: TableState<TableRowProps>;
  /** Keeps the heading visible above keyboard-focused rows */
  stickyHeader: boolean;
}

interface VirtualTableRow {
  /** Zero-based position in the full collection */
  index: number;
  /** Collection node rendered at this position */
  node: NonNullable<
    ReturnType<TableState<TableRowProps>['collection']['getItem']>
  >;
  /** Height of skipped rows before this item */
  spaceBefore: number;
}

interface TableVirtualizerResult {
  /** Mounted rows and their spacer geometry */
  items: VirtualTableRow[];
  /** Geometry used by React Aria's keyboard navigation */
  layoutDelegate: NonNullable<AriaTableProps['layoutDelegate']>;
  /** Height of skipped rows after the mounted window */
  trailingSpace: number;
}

/** Visible row bounds with overscan, clamped after scrolling or collection changes */
export const getTableWindow = (
  count: number,
  offset: number,
  height: number,
  rowHeight: number,
) => {
  const start = Math.max(
    0,
    Math.min(count - 1, Math.floor(Math.max(0, offset) / rowHeight)) - 5,
  );
  const end = Math.min(
    count,
    Math.max(
      start + 1,
      Math.ceil((Math.max(0, offset) + height) / rowHeight) + 5,
    ),
  );
  return { start, end };
};

/**
 * Keeps native table rows windowed while React Aria retains the full collection
 *
 * The full collection supports keyboard navigation beyond mounted rows. The focused
 * row stays mounted, and new keyboard targets scroll into view before receiving focus
 * Fixed row heights keep spacer geometry and Page Up/Down navigation consistent
 */
const useTableVirtualizer = ({
  enabled,
  headerRef,
  maxTableHeight,
  rowHeight,
  scrollRef,
  state,
  stickyHeader,
}: TableVirtualizerOptions): TableVirtualizerResult => {
  const [viewport, setViewport] = useState({
    headerHeight: 45,
    height: maxTableHeight - 32,
    tableOffset: 0,
    top: 0,
  });
  const nodes = useMemo(() => {
    return Array.from(state.collection.body.childNodes);
  }, [state.collection]);
  const rowIndexes = useMemo(() => {
    return new Map(
      nodes.map((node, index) => {
        return [node.key, index];
      }),
    );
  }, [nodes]);
  const { focusedKey } = state.selectionManager;

  // cell focus keeps its owning row mounted alongside the visible window
  const focusedNode =
    focusedKey == null ? null : state.collection.getItem(focusedKey);
  const focusedRowKey =
    focusedNode?.type === 'cell' ? focusedNode.parentKey : focusedKey;
  const focusedRowIndex =
    focusedRowKey == null ? undefined : rowIndexes.get(focusedRowKey);

  useLayoutEffect(() => {
    const surface = scrollRef.current;
    if (!enabled || !surface) {
      return undefined;
    }

    // update row bounds after scrolling or resizing the surface
    const handleMeasure = () => {
      const next = {
        top: surface.scrollTop,
        height: surface.clientHeight || maxTableHeight - 32,
        headerHeight: headerRef.current?.getBoundingClientRect().height ?? 45,
        tableOffset: headerRef.current?.parentElement?.offsetTop ?? 0,
      };
      setViewport((previous) => {
        return previous.top === next.top &&
          previous.height === next.height &&
          previous.headerHeight === next.headerHeight &&
          previous.tableOffset === next.tableOffset
          ? previous
          : next;
      });
    };

    handleMeasure();
    const observer = new ResizeObserver(handleMeasure);
    observer.observe(surface);
    surface.addEventListener('scroll', handleMeasure, { passive: true });
    return () => {
      observer.disconnect();
      surface.removeEventListener('scroll', handleMeasure);
    };
  }, [enabled, headerRef, maxTableHeight, scrollRef]);

  useLayoutEffect(() => {
    const surface = scrollRef.current;
    const index = focusedRowIndex;
    if (!enabled || !surface) {
      return;
    }
    if (index == null) {
      if (focusedNode?.type === 'column' || focusedNode?.type === 'headerrow') {
        surface.scrollTop = 0;
        setViewport((previous) => {
          return previous.top === surface.scrollTop
            ? previous
            : { ...previous, top: surface.scrollTop };
        });
      }
      return;
    }

    const top =
      viewport.tableOffset + viewport.headerHeight + index * rowHeight;
    const height = surface.clientHeight || maxTableHeight - 32;
    if (top < surface.scrollTop + (stickyHeader ? viewport.headerHeight : 0)) {
      surface.scrollTop = Math.max(0, top - viewport.headerHeight);
    } else if (top + rowHeight > surface.scrollTop + height) {
      surface.scrollTop = top + rowHeight - height;
    }

    setViewport((previous) => {
      return previous.top === surface.scrollTop
        ? previous
        : { ...previous, top: surface.scrollTop };
    });
  }, [
    enabled,
    focusedKey,
    focusedNode?.type,
    focusedRowIndex,
    maxTableHeight,
    rowHeight,
    rowIndexes,
    scrollRef,
    stickyHeader,
    viewport.headerHeight,
    viewport.tableOffset,
  ]);

  const range = getTableWindow(
    nodes.length,
    viewport.top - viewport.headerHeight - viewport.tableOffset,
    viewport.height,
    rowHeight,
  );
  const indexes = enabled
    ? Array.from({ length: range.end - range.start }, (_, index) => {
        return range.start + index;
      })
    : nodes.map((_, index) => {
        return index;
      });
  const focusedIndex = focusedRowIndex;
  if (enabled && focusedIndex != null && !indexes.includes(focusedIndex)) {
    indexes.push(focusedIndex);
    indexes.sort((a, b) => {
      return a - b;
    });
  }

  const layoutDelegate: NonNullable<AriaTableProps['layoutDelegate']> = {
    getContentSize: () => {
      return {
        width: scrollRef.current?.scrollWidth ?? 0,
        height: Math.max(
          scrollRef.current?.scrollHeight ?? 0,
          viewport.tableOffset +
            viewport.headerHeight +
            nodes.length * rowHeight,
        ),
      };
    },
    getItemRect: (key) => {
      const node = state.collection.getItem(key);
      const index =
        rowIndexes.get(key) ??
        (node?.parentKey == null ? undefined : rowIndexes.get(node.parentKey));
      return index == null
        ? null
        : {
            x: 0,
            y: viewport.tableOffset + viewport.headerHeight + index * rowHeight,
            width: scrollRef.current?.clientWidth ?? 0,
            height: rowHeight,
          };
    },
    getVisibleRect: () => {
      return {
        x: scrollRef.current?.scrollLeft ?? 0,
        y: scrollRef.current?.scrollTop ?? 0,
        width: scrollRef.current?.clientWidth ?? 0,
        height: viewport.height,
      };
    },
  };

  // retain spacer heights without exposing scroll arithmetic to the renderer
  const items = indexes.map((index, position) => {
    return {
      index,
      node: nodes[index],
      spaceBefore: enabled
        ? (index - (position ? indexes[position - 1] + 1 : 0)) * rowHeight
        : 0,
    };
  });
  const trailingSpace = enabled
    ? (nodes.length - (indexes.length ? indexes[indexes.length - 1] + 1 : 0)) *
      rowHeight
    : 0;

  return { items, layoutDelegate, trailingSpace };
};

export default useTableVirtualizer;
