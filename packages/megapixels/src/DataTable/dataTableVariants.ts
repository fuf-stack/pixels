import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv } from '@fuf-stack/pixel-utils';

/** Styling slots for DataTable */
export const dataTableVariants = tv({
  slots: {
    /** Root wrapper around toolbar, table, and pagination */
    base: 'w-full',
    /** Selection checkbox control in header/rows */
    checkbox: [
      // checkbox layout
      'relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center',
      // outline and surface
      'rounded border border-divider bg-background align-middle text-foreground',
    ],
    /** Checkmark/minus glyph inside the selection checkbox */
    checkboxIndicator:
      'pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] leading-none',
    /** Empty-state cell shown when no rows match */
    emptyCell: 'h-24 text-center text-default-500',
    /** Button used by the injected expandable-row toggle column */
    expandButton:
      'h-8 min-w-8 px-0 disabled:cursor-not-allowed data-[disabled=true]:pointer-events-auto data-[disabled=true]:cursor-not-allowed',
    /** Table cell that spans all visible columns for expanded content */
    expandedCell: 'p-4 text-sm text-default-600',
    /** Table row rendered directly below an expanded data row */
    expandedRow: 'bg-content1',
    /** Icon wrapper inside the expandable-row toggle button */
    expandIcon:
      'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-default-500',
    /** Header/body cell reserved for the expandable-row toggle column */
    expansionCell: 'w-10 px-0 text-center',
    /** Inner wrapper that visually centers expandable-row toggle buttons */
    expansionCellContent: 'flex justify-center',
    /** Loading-state cell shown while data is being fetched */
    loadingCell: 'h-24 text-center text-default-500',
    /** Loading/retry cell shown when fetching next page in infinite mode */
    loadingMoreCell: 'flex h-14 items-center justify-center text-default-500',
    /** Plain header content used for non-sortable columns */
    nonSortableHeaderContent: 'inline-flex items-center',
    /** Label wrapping the "Rows per page" selector */
    pageSizeLabel: 'flex items-center gap-2 text-sm text-default-500',
    /** Menu trigger used to choose page size */
    pageSizeSelect: 'min-w-16 justify-between gap-2',
    /** "Page X of Y" summary text */
    pageSummary: "text-sm text-default-500",
    /** Pagination footer container */
    pagination: 'flex items-center gap-2 py-4',
    /** Shared class applied to pagination action buttons */
    paginationButton: '',
    /** Placeholder rows for unknown-yet data in total-count mode */
    placeholderCell:
      'h-10 animate-pulse bg-default-100/60 p-3 dark:bg-default-100/10',
    /** Scroll container in virtualized/infinite mode */
    scrollContainer: 'overflow-y-auto overflow-x-hidden',
    /** Optional styling slot for ScrollShadow wrapper behavior */
    scrollShadow: '',
    /** Built-in text search input(s) rendered in the toolbar */
    searchInput: [
      // input dimensions and surface
      'h-10 w-full max-w-sm rounded-small border-2 border-default-200 bg-transparent px-3 text-sm text-foreground',
      // focus outline and transitions
      'outline-none transition-colors',
      // placeholder and interaction colors
      'placeholder:text-default-500 hover:border-default-400 data-[focused=true]:border-focus dark:border-default-100',
    ],
    /** Header/body cell reserved for the selection checkbox column */
    selectionCell: 'w-10 px-0 text-center',
    /** Inner wrapper that visually centers selection checkboxes in their cells */
    selectionCellContent: 'flex justify-center',
    /** Selected rows summary text in pagination footer */
    selectionSummary: 'mr-auto text-sm text-default-500',
    /** Header button used for sortable columns */
    sortButton:
      '-ml-2 min-w-0 justify-start gap-1.5 px-2 text-left font-medium text-foreground data-[sortable=true]:cursor-pointer',
    /** Icon wrapper for sort direction indicators */
    sortIcon:
      'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-default-400',
    /** Semantic table element */
    table: 'w-full caption-bottom text-sm',
    /** Border/overflow container around the table */
    tableWrapper: 'overflow-hidden rounded-md border border-divider',
    /** Semantic table body wrapper */
    tbody: '',
    /** Standard table data cell */
    td: 'p-3 align-middle text-foreground',
    /** Standard table header cell */
    th: 'h-10 px-3 text-left align-middle font-medium text-foreground',
    /** Table header row group background */
    thead: 'bg-content2',
    /** Toolbar container for filters/actions */
    toolbar: 'flex items-center gap-3 py-4',
    /** Optional custom toolbar content area */
    toolbarContent: 'flex flex-1 items-center',
    /** Table row styling including selected-row state */
    tr: 'border-b border-divider last:border-b-0 data-[state=selected]:bg-content2/60',
    /** Checkmark indicator area inside view options menu items */
    viewOptionsIndicator: 'mr-2 inline-flex w-3 justify-center',
    /** Individual view-options menu item */
    viewOptionsItem: [
      // highlighted item colors
      'data-highlighted:bg-default-100 dark:data-highlighted:bg-default-100/20',
      // menu item layout and typography
      'flex cursor-pointer items-center rounded px-2 py-1 text-sm text-foreground outline-none',
    ],
    /** Dropdown menu panel for view options */
    viewOptionsMenu:
      'z-50 min-w-40 rounded-md border border-divider bg-background p-1 shadow-md',
    /** Positioner wrapper used by menu popover */
    viewOptionsPositioner: 'outline-none',
    /** Trigger button for the "Columns" menu */
    viewOptionsTrigger: 'ml-auto gap-2',
  },
});

export type VariantProps = TVProps<typeof dataTableVariants>;

export type ClassName = TVClassName<typeof dataTableVariants>;

export type DataTableClassNames = Record<
  keyof ReturnType<typeof dataTableVariants>,
  string
>;

export default dataTableVariants;
