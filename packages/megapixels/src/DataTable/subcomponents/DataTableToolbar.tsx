import type { Table } from '@tanstack/react-table';
import type { RefObject } from 'react';
import type { DataTableProps, DataTableSearchField } from '../DataTable';
import type { DataTableClassNames } from '../dataTableVariants';

import DataTableSearchInput from './DataTableSearchInput';
import DataTableViewOptions from './DataTableViewOptions';

interface DataTableToolbarProps<TData> extends Pick<
  DataTableProps<TData, unknown>,
  'icons' | 'testId' | 'toolbarContent'
> {
  /** Resolved CSS class names */
  className: DataTableClassNames;
  /** Enables column visibility controls */
  columnVisibility: boolean;
  /** Server-side search configuration */
  infiniteScroll?: NonNullable<
    DataTableProps<TData, unknown>['features']
  >['infiniteScroll'];
  /** Scroll viewport reset after a server-side search */
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  /** Configured search columns */
  searchFields: DataTableSearchField[];
  /** Table filter and visibility state */
  table: Table<TData>;
}

/** Search, custom actions and column visibility controls above the table */
const DataTableToolbar = <TData,>({
  className: classNames,
  columnVisibility: resolvedEnableColumnVisibility,
  icons = undefined,
  infiniteScroll: resolvedInfiniteScroll = undefined,
  scrollContainerRef,
  searchFields: resolvedSearchFields,
  table,
  testId = undefined,
  toolbarContent = undefined,
}: DataTableToolbarProps<TData>) => {
  const showToolbar =
    resolvedSearchFields.length > 0 ||
    resolvedEnableColumnVisibility ||
    Boolean(toolbarContent);

  return (
    <>
      {/* Optional toolbar area for built-in search, custom content, and column visibility controls. */}
      {showToolbar ? (
        <div className={classNames.toolbar} data-slot="toolbar">
          {toolbarContent ? (
            <div
              className={classNames.toolbarContent}
              data-slot="toolbar-content"
            >
              {toolbarContent}
            </div>
          ) : null}
          {resolvedSearchFields.map((searchField) => {
            return (
              <DataTableSearchInput
                key={searchField.column}
                className={classNames.searchInput}
                infiniteScroll={resolvedInfiniteScroll}
                scrollContainerRef={scrollContainerRef}
                searchField={searchField}
                searchFieldCount={resolvedSearchFields.length}
                table={table}
                testId={testId}
              />
            );
          })}

          {resolvedEnableColumnVisibility ? (
            <DataTableViewOptions
              className={{
                viewOptionsIndicator: classNames.viewOptionsIndicator,
                viewOptionsItem: classNames.viewOptionsItem,
                viewOptionsTrigger: classNames.viewOptionsTrigger,
              }}
              table={table}
              testId={testId}
              triggerIcon={icons?.columnVisibility?.trigger}
              visibleIcon={icons?.columnVisibility?.visible}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default DataTableToolbar;
