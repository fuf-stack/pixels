/* eslint-disable import-x/prefer-default-export */

import type { Row } from '@tanstack/react-table';
import type { ReactNode, RefObject } from 'react';
import type {
  DataTableExpandableRowsFeature,
  DataTableInfiniteScrollFeature,
  DataTableVirtualizationFeature,
} from '../DataTable';
import type { DataTableClassNames } from './DataTableCells';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';

import { useDataTableVirtualizer } from '../hooks/useDataTableVirtualizer';
import {
  DataTableBodyCell,
  getColumnKind,
  getVirtualCellStyle,
  virtualFullWidthCellStyle,
  virtualFullWidthRowStyle,
} from './DataTableCells';

interface DataTableVirtualBodyRowsProps<TData> {
  /** Slot classes resolved by `dataTableVariants`. */
  classNames: DataTableClassNames;
  /** Optional expanded-row behavior and content renderer. */
  expandableRows?: DataTableExpandableRowsFeature<TData>;
  /** Optional cursor-based infinite-scroll state/callbacks. */
  infiniteScroll?: DataTableInfiniteScrollFeature;
  /** Content shown in the load-more row while next page is fetching. */
  loadingMoreContent?: ReactNode;
  /** Retry button label/content when load-more fails. */
  retryContent?: ReactNode;
  /** TanStack rows currently loaded in the table model. */
  rows: Row<TData>[];
  /** Scroll container consumed by the shared virtualizer hook. */
  scrollElementRef?: RefObject<HTMLDivElement | null>;
  /** Enables virtualized row/cell sizing behavior. */
  virtualized: boolean;
  /** Virtualizer options (maxHeight, estimate, dynamic sizing, overscan). */
  virtualization?: DataTableVirtualizationFeature;
  /** Current visible column count for full-width helper rows. */
  visibleColumnCount: number;
}

/**
 * Virtualized row renderer for DataTable body.
 *
 * It maps virtual items (row/expanded/placeholder/load-more) to absolute
 * positioned `<tr>` elements and delegates load-more retry handling.
 */
export const DataTableVirtualBodyRows = <TData,>({
  classNames,
  expandableRows = undefined,
  infiniteScroll = undefined,
  loadingMoreContent = 'Loading more...',
  retryContent = 'Load next page',
  rows,
  scrollElementRef = undefined,
  virtualized,
  virtualization = undefined,
  visibleColumnCount,
}: DataTableVirtualBodyRowsProps<TData>) => {
  // Shared hook flattens rows + expanded rows + placeholders + sentinel.
  const { getItem, measureElement, retry, totalSize, virtualItems } =
    useDataTableVirtualizer({
      expandableRows,
      infiniteScroll,
      rows,
      scrollElementRef,
      virtualization,
    });

  return (
    <>
      {/* Spacer row defines the total virtual height inside tbody. */}
      <tr style={{ height: `${totalSize}px` }}>
        <td
          aria-label="Virtual spacer row"
          colSpan={visibleColumnCount}
          style={{ padding: 0 }}
        />
      </tr>

      {virtualItems.map((virtualItem) => {
        // Resolve the view model item backing this virtual row index.
        const item = getItem(virtualItem);
        if (!item) {
          return null;
        }

        if (item.kind === 'row') {
          return (
            <tr
              key={item.key}
              ref={measureElement}
              className={classNames.tr}
              data-index={virtualItem.index}
              data-slot="tr"
              data-state={item.row.getIsSelected() ? 'selected' : undefined}
              style={{
                display: virtualized ? 'flex' : undefined,
                position: 'absolute',
                transform: `translateY(${virtualItem.start}px)`,
                width: '100%',
              }}
            >
              {item.row.getVisibleCells().map((cell) => {
                return (
                  <DataTableBodyCell
                    key={cell.id}
                    cell={cell}
                    classNames={classNames}
                    virtualized={virtualized}
                  />
                );
              })}
            </tr>
          );
        }

        if (item.kind === 'expanded') {
          // Expanded content consumes full table width as a dedicated row.
          return (
            <tr
              key={item.key}
              ref={measureElement}
              className={cn(classNames.tr, classNames.expandedRow)}
              data-index={virtualItem.index}
              data-slot="expanded-row"
              style={virtualFullWidthRowStyle(virtualItem.start)}
            >
              <td
                className={classNames.expandedCell}
                colSpan={visibleColumnCount}
                data-slot="expanded-cell"
                style={virtualFullWidthCellStyle}
              >
                {expandableRows?.renderContent?.(item.row)}
              </td>
            </tr>
          );
        }

        if (item.kind === 'placeholder') {
          // Placeholder rows reserve scroll height in total-count mode.
          return (
            <tr
              key={item.key}
              ref={measureElement}
              className={classNames.tr}
              data-index={virtualItem.index}
              data-slot="placeholder-row"
              style={{
                ...virtualFullWidthRowStyle(virtualItem.start),
                height: `${virtualItem.size}px`,
              }}
            >
              {/* Reuse visible columns so placeholder widths match real cells. */}
              {rows[0]?.getVisibleCells().map((cell) => {
                const columnKind = getColumnKind(cell.column.id);
                return (
                  <td
                    key={`${item.key}-${cell.column.id}`}
                    aria-label="Loading placeholder"
                    className={classNames.placeholderCell}
                    data-slot="placeholder-cell"
                    style={getVirtualCellStyle(
                      columnKind,
                      cell.column.getSize(),
                    )}
                  >
                    <span className="block h-3 rounded bg-default-300/50 dark:bg-default-300/20" />
                  </td>
                );
              })}
            </tr>
          );
        }

        return (
          <tr
            key={item.key}
            ref={measureElement}
            className={classNames.tr}
            data-index={virtualItem.index}
            data-slot="loading-more-row"
            style={virtualFullWidthRowStyle(virtualItem.start)}
          >
            <td
              className={classNames.loadingMoreCell}
              colSpan={visibleColumnCount}
              data-slot="loading-more-cell"
              style={virtualFullWidthCellStyle}
            >
              {/* Sentinel row switches between retry action and loading state. */}
              {infiniteScroll?.loadMoreError ? (
                <Button
                  dataSlot="load-more-retry-button"
                  onClick={retry}
                  size="sm"
                  variant="bordered"
                >
                  {retryContent}
                </Button>
              ) : (
                loadingMoreContent
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
};
