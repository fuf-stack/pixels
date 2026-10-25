import type { Table } from '@tanstack/react-table';
import type { RefObject } from 'react';
import type {
  DataTableFeatures,
  DataTableProps,
  DataTableVirtualizationFeature,
} from '../DataTable';
import type { DataTableClassNames } from '../dataTableVariants';

import { ScrollShadow } from '@fuf-stack/pixels/ScrollShadow';

import DataTableBodyRows from './DataTableBodyRows';
import DataTableHeaderRows from './DataTableHeaderRows';
import DataTableStateRows from './DataTableStateRows';
import { DataTableVirtualBodyRows } from './DataTableVirtualBodyRows';

interface DataTableSurfaceProps<TData> extends Pick<
  DataTableProps<TData, unknown>,
  'ariaLabel' | 'emptyContent' | 'icons' | 'loading' | 'loadingContent'
> {
  /** Resolved CSS class names */
  className: DataTableClassNames;
  /** Expanded detail and child-row configuration */
  expandableRows?: DataTableFeatures<TData>['expandableRows'];
  /** Cursor-based page loading configuration */
  infiniteScroll?: DataTableFeatures<TData>['infiniteScroll'];
  /** Scroll viewport shared with sorting and search */
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  /** Table state and visible rows */
  table: Table<TData>;
  /** Virtual viewport configuration */
  virtualization?: DataTableVirtualizationFeature;
  /** Uses a separate header and virtualized scroll body */
  virtualized: boolean;
}

/** Semantic table surface with standard or virtualized row composition */
const DataTableSurface = <TData,>({
  ariaLabel = undefined,
  className: classNames,
  emptyContent = undefined,
  expandableRows: resolvedExpandableRows = undefined,
  icons = undefined,
  infiniteScroll: resolvedInfiniteScroll = undefined,
  loading = false,
  loadingContent = undefined,
  scrollContainerRef,
  table,
  virtualization: virtualConfig = undefined,
  virtualized,
}: DataTableSurfaceProps<TData>) => {
  const tableRows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  if (virtualized) {
    return (
      <>
        {/* Keep header outside the scroll container so body owns scrollbar. */}
        <table
          aria-hidden={loading && tableRows.length === 0 ? 'true' : undefined}
          className={classNames.table}
          data-slot="table"
          style={{ display: 'grid' }}
        >
          <thead className={classNames.thead} data-slot="thead">
            <DataTableHeaderRows
              className={classNames}
              sortIcons={icons?.sort}
              table={table}
              virtualized
            />
          </thead>
        </table>

        <ScrollShadow
          ref={scrollContainerRef}
          className={
            classNames.scrollShadow
              ? `${classNames.scrollContainer} ${classNames.scrollShadow}`
              : classNames.scrollContainer
          }
          // show scroll shadow when there is no page load more error
          dataSlot="scroll-container"
          size={virtualConfig?.scrollShadowSize ?? 40}
          style={{ maxHeight: virtualConfig?.maxHeight }}
          visibility={resolvedInfiniteScroll?.loadMoreError ? 'none' : 'auto'}
        >
          <table
            aria-label={ariaLabel}
            className={classNames.table}
            data-slot="table"
            style={{ display: 'grid' }}
          >
            <tbody
              className={classNames.tbody}
              data-slot="tbody"
              style={{ display: 'grid', position: 'relative' }}
            >
              {loading ? null : (
                <DataTableVirtualBodyRows
                  className={classNames}
                  expandableRows={resolvedExpandableRows}
                  infiniteScroll={resolvedInfiniteScroll}
                  loadingMoreContent={
                    resolvedInfiniteScroll?.loadingMoreContent
                  }
                  retryContent={resolvedInfiniteScroll?.retryContent}
                  rows={tableRows}
                  scrollElementRef={scrollContainerRef}
                  virtualization={virtualConfig}
                  virtualized
                  visibleColumnCount={visibleColumnCount}
                />
              )}
              <DataTableStateRows
                className={classNames}
                emptyContent={emptyContent}
                loading={loading}
                loadingContent={loadingContent}
                rowCount={tableRows.length}
                visibleColumnCount={visibleColumnCount}
              />
            </tbody>
          </table>
        </ScrollShadow>
      </>
    );
  }

  return (
    <table
      aria-label={ariaLabel}
      className={classNames.table}
      data-slot="table"
    >
      <thead className={classNames.thead} data-slot="thead">
        {/* Header groups come from TanStack and support sorting per column. */}
        <DataTableHeaderRows
          className={classNames}
          sortIcons={icons?.sort}
          table={table}
        />
      </thead>
      <tbody className={classNames.tbody} data-slot="tbody">
        {loading ? null : (
          <DataTableBodyRows
            className={classNames}
            expandableRows={resolvedExpandableRows}
            rows={tableRows}
            visibleColumnCount={visibleColumnCount}
          />
        )}
        {/* Loading and empty states reserve full table width via visible column span. */}
        <DataTableStateRows
          className={classNames}
          emptyContent={emptyContent}
          loading={loading}
          loadingContent={loadingContent}
          rowCount={tableRows.length}
          visibleColumnCount={visibleColumnCount}
        />
      </tbody>
    </table>
  );
};

export default DataTableSurface;
