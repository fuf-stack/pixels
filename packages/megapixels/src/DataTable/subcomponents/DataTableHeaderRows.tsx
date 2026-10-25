import type { Table } from '@tanstack/react-table';
import type { DataTableIcons } from '../DataTable';
import type { DataTableClassNames } from '../dataTableVariants';

import DataTableHeaderCell from './DataTableHeaderCell';

interface DataTableHeaderRowsProps<TData> {
  /** Resolved CSS class names */
  className: DataTableClassNames;
  /** Sort indicator overrides */
  sortIcons?: DataTableIcons['sort'];
  /** Table state and header groups */
  table: Table<TData>;
  /** Uses flex layout for virtual columns */
  virtualized?: boolean;
}

/** Column header groups and sorting controls for either table layout */
const DataTableHeaderRows = <TData,>({
  className: classNames,
  sortIcons = undefined,
  table,
  virtualized = false,
}: DataTableHeaderRowsProps<TData>) => {
  return table.getHeaderGroups().map((headerGroup) => {
    return (
      <tr
        key={headerGroup.id}
        className={classNames.tr}
        data-slot="tr"
        style={virtualized ? { display: 'flex', width: '100%' } : undefined}
      >
        {headerGroup.headers.map((header) => {
          return (
            <DataTableHeaderCell
              key={header.id}
              className={classNames}
              header={header}
              sortIcons={sortIcons}
              virtualized={virtualized}
            />
          );
        })}
      </tr>
    );
  });
};

export default DataTableHeaderRows;
