import type { ExpandedState, SortingState, VisibilityState } from "@tanstack/react-table";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,

  useReactTable,

} from "@tanstack/react-table";
import { Fragment, useEffect, useState } from "react";

import { DataTablePagination, DataTableToolbar } from "@/web/components/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table";
import { useTableUrlState } from "@/web/hooks/use-table-url-state";
import { cn } from "@/web/lib/utils";

import {
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
} from "../data/data";
import { createOrdersQueryOptions } from "../data/queries";
import { DataTableBulkActions } from "./data-table-bulk-actions";
import { OrderExpandedPanel } from "./order-expanded-panel";
import { ordersColumns as columns } from "./orders-columns";

const route = getRouteApi("/_authenticated/orders/$customerId");

export function OrdersTable() {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: true,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const navigate = route.useNavigate();
  const params = route.useParams();
  const search = route.useSearch();

  const { data: { rows: data, rowCount, pageCount } } = useSuspenseQuery(createOrdersQueryOptions({
    ...search,
    customerId: params.customerId,
  }));

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror orders route search schema)
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      // firstName per-column text filter
      { columnId: "id", searchKey: "id", type: "string" },
      { columnId: "orderStatus", searchKey: "orderStatus", type: "array" },
      { columnId: "paymentStatus", searchKey: "paymentStatus", type: "array" },
      { columnId: "paymentMethod", searchKey: "paymentMethod", type: "array" },
    ],
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
      expanded,
    },
    rowCount,
    pageCount,
    manualPagination: true,
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: row => (row.original.items?.length ?? 0) > 0,
  });

  useEffect(() => {
    ensurePageInRange(table.getPageCount());
  }, [table, ensurePageInRange]);

  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder="Filter by order number..."
        searchKey="id"
        filters={[
          {
            columnId: "orderStatus",
            title: "Order Status",
            options: orderStatusValues.map(status => ({
              label: status.replace(/-/g, " "),
              value: status,
            })),
          },
          {
            columnId: "paymentStatus",
            title: "Payment Status",
            options: paymentStatusValues.map(status => ({
              label: status.replace(/-/g, " "),
              value: status,
            })),
          },
          {
            columnId: "paymentMethod",
            title: "Payment Method",
            options: paymentMethodValues.map(method => ({
              label: method.replace(/-/g, " "),
              value: method,
            })),
          },
        ]}
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                        // @ts-expect-error TS is confused here
                        header.column.columnDef.meta?.className ?? "",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length
              ? (
                  table.getRowModel().rows.map(row => (
                    <Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className="group/row"
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                              // @ts-expect-error TS is confused here
                              cell.column.columnDef.meta?.className ?? "",
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() && (
                        <TableRow className="bg-muted/40">
                          <TableCell colSpan={visibleColumnCount} className="p-4">
                            <OrderExpandedPanel order={row.original} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )
              : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />
    </div>
  );
}
