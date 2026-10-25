import type { TableState } from 'react-stately';
import type { TableProps, TableRowProps } from '../Table';
import type { TableClassNames } from '../tableVariants';

import { Fragment, useMemo, useRef } from 'react';
import { useTable, useTableRowGroup } from 'react-aria';
import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  useTableState,
} from 'react-stately';

import useTableVirtualizer from '../hooks/useTableVirtualizer';
import TableBodyRow from './TableBodyRow';
import TableHeaderRow from './TableHeaderRow';

export type TableNode = NonNullable<
  ReturnType<TableState<TableRowProps>['collection']['getItem']>
>;

type TableCollectionChildren = Parameters<
  typeof useTableState<TableRowProps>
>[0]['children'];

interface TableGridProps extends Omit<
  TableProps,
  'className' | 'hideHeader' | 'separation' | 'testId'
> {
  /** CSS class name */
  className: TableClassNames;
}

/** Native table associations, full collection and optional scrolling surface
 *
 * @see https://react-aria.adobe.com/Table/useTable
 */
const TableGrid = ({
  ariaLabel = undefined,
  bottomContent = undefined,
  className,
  columns,
  emptyContent = undefined,
  hasWrapper = false,
  loading = false,
  loadingContent = undefined,
  maxTableHeight = 600,
  rowHeight = 40,
  rows = [],
  stickyHeader = false,
  virtualized = false,
}: TableGridProps) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // keep the full collection stable while only the visible row window changes
  const collection = useMemo<TableCollectionChildren>(() => {
    return [
      <TableHeader key="header" columns={columns}>
        {(column) => {
          return (
            <Column
              key={column.key}
              isRowHeader={column.key === columns[0]?.key}
            >
              {column.label}
            </Column>
          );
        }}
      </TableHeader>,
      <TableBody key="body" items={rows}>
        {(row) => {
          return (
            <Row
              key={row.key}
              textValue={
                typeof row[columns[0]?.key] === 'string'
                  ? String(row[columns[0].key])
                  : String(row.key)
              }
            >
              {(key) => {
                return <Cell>{row[key]}</Cell>;
              }}
            </Row>
          );
        }}
      </TableBody>,
    ];
  }, [columns, rows]);
  const state = useTableState<TableRowProps>({
    children: collection,
    selectionMode: 'none',
  });

  const effectiveRowHeight = rowHeight > 0 ? rowHeight : 40;
  const { items, layoutDelegate, trailingSpace } = useTableVirtualizer({
    enabled: virtualized,
    headerRef,
    maxTableHeight,
    rowHeight: effectiveRowHeight,
    scrollRef,
    state,
    stickyHeader,
  });
  const { gridProps } = useTable(
    {
      'aria-label': ariaLabel ?? 'Table',
      isVirtualized: virtualized,
      layoutDelegate: virtualized ? layoutDelegate : undefined,
      scrollRef: hasWrapper || virtualized ? scrollRef : undefined,
    },
    state,
    tableRef,
  );
  const { rowGroupProps } = useTableRowGroup();

  // spacer rows retain native column sizing and full scroll geometry
  const renderSpacer = (height: number) => {
    return height > 0 ? (
      <tr aria-hidden="true">
        <td
          aria-hidden="true"
          colSpan={columns.length}
          style={{ height, padding: 0 }}
        />
      </tr>
    ) : null;
  };

  const content = (
    <>
      <table
        {...gridProps}
        ref={tableRef}
        aria-busy={loading || undefined}
        aria-label={ariaLabel ?? 'Table'}
        className={className.table}
        data-slot="table"
      >
        {/* column headings and their keyboard targets */}
        <thead
          {...rowGroupProps}
          ref={headerRef}
          className={className.thead}
          data-slot="thead"
        >
          {state.collection.headerRows.map((node) => {
            return (
              <TableHeaderRow
                key={node.key}
                className={className}
                node={node}
                state={state}
                virtualized={virtualized}
              />
            );
          })}
        </thead>

        {/* visible data rows or the empty message */}
        <tbody
          {...rowGroupProps}
          className={className.tbody}
          data-empty={!rows.length || undefined}
          data-slot="tbody"
        >
          {items.map(({ node, index, spaceBefore }) => {
            return (
              <Fragment key={node.key}>
                {renderSpacer(spaceBefore)}
                <TableBodyRow
                  className={className}
                  count={rows.length}
                  index={index}
                  node={node}
                  rowHeight={effectiveRowHeight}
                  state={state}
                  virtualized={virtualized}
                />
              </Fragment>
            );
          })}
          {renderSpacer(trailingSpace)}
          {!rows.length && !loading ? (
            <tr role="row">
              <td colSpan={columns.length} role="gridcell">
                <div
                  className={className.emptyWrapper}
                  data-slot="emptyWrapper"
                >
                  {emptyContent}
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {/* loading overlays keep already loaded rows available */}
      {loading ? (
        <div
          className={className.loadingWrapper}
          data-slot="loadingWrapper"
          role="status"
        >
          {loadingContent ?? '...'}
        </div>
      ) : null}
      {bottomContent}
    </>
  );

  return hasWrapper || virtualized ? (
    <div
      ref={scrollRef}
      className={className.wrapper}
      data-slot="wrapper"
      style={
        virtualized ? { height: maxTableHeight, display: 'block' } : undefined
      }
    >
      {content}
    </div>
  ) : (
    content
  );
};

export default TableGrid;
