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

/**
 * TanStack Table v9 features registered by DataTable. Every alias below binds
 * this feature set, so the types only expose APIs that DataTable enables.
 */
type DataTableTanStackFeatures = typeof dataTableFeatures;

/**
 * Column definition accepted by the DataTable `columns` prop.
 *
 * @typeParam TData - Shape of one row in the `data` prop
 * @typeParam TValue - Value returned by the column accessor; defaults to `unknown`
 */
export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<DataTableTanStackFeatures, TData, TValue>;

/**
 * Row passed to DataTable callbacks such as `renderContent` and `sortFn`.
 * Provides the original data and row state like selection and expansion.
 *
 * @typeParam TData - Shape of one row in the `data` prop
 */
export type DataTableRow<TData extends RowData> = Row<
  DataTableTanStackFeatures,
  TData
>;

/**
 * Column instance with runtime state such as visibility, sorting and filter
 * value. Used internally by the column visibility menu.
 *
 * @typeParam TData - Shape of one row in the `data` prop
 * @typeParam TValue - Value returned by the column accessor; defaults to `unknown`
 */
export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
  DataTableTanStackFeatures,
  TData,
  TValue
>;

/**
 * Body cell instance for one row and column. Used internally to render cells.
 *
 * @typeParam TData - Shape of one row in the `data` prop
 * @typeParam TValue - Value of the cell; defaults to `unknown`
 */
export type DataTableCell<TData extends RowData, TValue = unknown> = Cell<
  DataTableTanStackFeatures,
  TData,
  TValue
>;

/**
 * Header cell instance for one column. Used internally to render headers and
 * sort controls.
 *
 * @typeParam TData - Shape of one row in the `data` prop
 * @typeParam TValue - Value returned by the column accessor; defaults to `unknown`
 */
export type DataTableHeader<TData extends RowData, TValue = unknown> = Header<
  DataTableTanStackFeatures,
  TData,
  TValue
>;

/**
 * Table instance returned by `useTable`, with state and row models. Used
 * internally by pagination and the column visibility menu.
 *
 * @typeParam TData - Shape of one row in the `data` prop
 */
export type DataTableTable<TData extends RowData> = ReactTable<
  DataTableTanStackFeatures,
  TData
>;
