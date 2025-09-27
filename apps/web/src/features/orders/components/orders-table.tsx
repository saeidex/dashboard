import type { SortingState, VisibilityState } from "@tanstack/react-table";

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,

  useReactTable,

} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import type { NavigateFn } from "@/web/hooks/use-table-url-state";

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

import type { Order } from "../data/schema";

import {
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
} from "../data/data";
import { DataTableBulkActions } from "./data-table-bulk-actions";
import { OrdersColumns as columns } from "./orders-columns";

type DataTableProps = {
  data: Order[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
};

export function OrdersTable({ data, search, navigate }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

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
      { columnId: "orderNumber", searchKey: "orderNumber", type: "string" },
      { columnId: "status", searchKey: "status", type: "array" },
      { columnId: "paymentStatus", searchKey: "paymentStatus", type: "array" },
      { columnId: "paymentMethod", searchKey: "paymentMethod", type: "array" },
    ],
  });

  const table = useReactTable({
    data,
    columns: columns(),
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    ensurePageInRange(table.getPageCount());
  }, [table, ensurePageInRange]);

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder="Filter by order number..."
        searchKey="orderNumber"
        filters={[
          {
            columnId: "status",
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
                    <TableRow
                      key={row.id}
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
