import type { Table } from '@tanstack/react-table';
import type { ChangeEvent, RefObject } from 'react';
import type {
  DataTableInfiniteScrollFeature,
  DataTableSearchField,
} from '../DataTable';

interface DataTableSearchInputProps<TData> {
  /** CSS class name */
  className: string;
  /** Server-side search configuration */
  infiniteScroll?: DataTableInfiniteScrollFeature;
  /** Scroll viewport reset after a server-side search */
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  /** Column and placeholder for this search field */
  searchField: DataTableSearchField;
  /** Number of configured search columns */
  searchFieldCount: number;
  /** Table filter state */
  table: Table<TData>;
  /** Test ID prefix for the owning table */
  testId?: string;
}

/** Column search input that commits filters and resets server-side scrolling */
const DataTableSearchInput = <TData,>({
  className,
  infiniteScroll: resolvedInfiniteScroll = undefined,
  scrollContainerRef,
  searchFieldCount,
  searchField,
  table,
  testId = undefined,
}: DataTableSearchInputProps<TData>) => {
  const searchValue =
    (table.getColumn(searchField.column)?.getFilterValue() as
      string | undefined) ?? '';
  let searchTestId: string | undefined;
  if (testId) {
    searchTestId =
      searchFieldCount === 1
        ? `${testId}-search`
        : `${testId}-search-${searchField.column}`;
  }

  // commit the column filter before requesting server-side results
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    table.getColumn(searchField.column)?.setFilterValue(value);
    if (resolvedInfiniteScroll) {
      resolvedInfiniteScroll.onSearchChange?.(searchField.column, value);
      scrollContainerRef.current?.scrollTo({
        top: 0,
      });
    }
  };

  return (
    <input
      className={className}
      data-focused={Boolean(searchValue)}
      data-slot="search-input"
      data-testid={searchTestId}
      onChange={handleChange}
      placeholder={searchField.placeholder ?? 'Search...'}
      value={searchValue}
    />
  );
};

export default DataTableSearchInput;
