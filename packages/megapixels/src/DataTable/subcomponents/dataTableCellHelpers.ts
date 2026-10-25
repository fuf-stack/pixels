import type { CSSProperties } from 'react';

import {
  EXPANSION_COLUMN_ID,
  SELECTION_COLUMN_ID,
} from '../hooks/useDataTableController';

export type DataTableColumnKind = 'data' | 'expansion' | 'selection';

// DataTable injects control columns; classify once for slot/style branching.
export const getColumnKind = (columnId: string): DataTableColumnKind => {
  if (columnId === EXPANSION_COLUMN_ID) {
    return 'expansion';
  }
  if (columnId === SELECTION_COLUMN_ID) {
    return 'selection';
  }
  return 'data';
};

export const getCellDataSlot = (columnKind: DataTableColumnKind) => {
  if (columnKind === 'expansion') {
    return 'expansion-cell';
  }
  if (columnKind === 'selection') {
    return 'selection-cell';
  }
  return 'td';
};

// Header slots mirror body slots for control columns and use `th` for data columns.
export const getHeaderDataSlot = (columnKind: DataTableColumnKind) => {
  if (columnKind === 'data') {
    return 'th';
  }
  return getCellDataSlot(columnKind);
};

// Selection/expansion controls use distinct inner wrappers for styling hooks.
export const getControlCellContentDataSlot = (
  columnKind: DataTableColumnKind,
) => {
  if (columnKind === 'expansion') {
    return 'expansion-cell-content';
  }
  return 'selection-cell-content';
};

/**
 * Flex sizing for cells in virtualized mode.
 *
 * Because virtual rows are absolutely positioned, we cannot rely on native
 * table layout for column width sync; header/body cells must apply matching
 * explicit sizing rules.
 */
export const getVirtualCellStyle = (
  columnKind: DataTableColumnKind,
  size: number,
): CSSProperties => {
  if (columnKind === 'data') {
    return { flex: `1 1 ${size}px`, minWidth: 0, width: size };
  }
  return { flex: `0 0 ${size}px`, width: size };
};

/** Shared row positioning style for full-width virtual rows. */
export const virtualFullWidthRowStyle = (start: number): CSSProperties => {
  return {
    display: 'flex',
    position: 'absolute',
    transform: `translateY(${start}px)`,
    width: '100%',
  };
};

/** Shared single-cell style for full-width virtual rows. */
export const virtualFullWidthCellStyle: CSSProperties = {
  flex: '1 1 auto',
  width: '100%',
};
