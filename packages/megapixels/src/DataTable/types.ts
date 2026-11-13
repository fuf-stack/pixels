import type {
  Cell,
  Column,
  ColumnDef,
  Header,
  ReactTable,
  Row,
  RowData,
} from '@tanstack/react-table';
import type dataTableFeatures from './features';

/** TanStack features registered by DataTable, bound into the aliases below */
type DataTableTanStackFeatures = typeof dataTableFeatures;
export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<DataTableTanStackFeatures, TData, TValue>;
export type DataTableRow<TData extends RowData> = Row<
  DataTableTanStackFeatures,
  TData
>;
export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
  DataTableTanStackFeatures,
  TData,
  TValue
>;
export type DataTableCell<TData extends RowData, TValue = unknown> = Cell<
  DataTableTanStackFeatures,
  TData,
  TValue
>;
export type DataTableHeader<TData extends RowData, TValue = unknown> = Header<
  DataTableTanStackFeatures,
  TData,
  TValue
>;
export type DataTableTable<TData extends RowData> = ReactTable<
  DataTableTanStackFeatures,
  TData
>;
