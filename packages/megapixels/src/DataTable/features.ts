import {
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  sortFns,
  stockFeatures,
  tableFeatures,
} from '@tanstack/react-table';

// Preserve the column capabilities available before v9; row processing is now
// registered separately from features. Manual options bypass disabled stages.
const dataTableFeatures = tableFeatures({
  ...stockFeatures,
  expandedRowModel: createExpandedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

export default dataTableFeatures;
