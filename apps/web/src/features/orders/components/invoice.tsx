import type { SortingState } from "@tanstack/react-table";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,

  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table";

import type { OrderWithItemsAndCustomer } from "../data/schema";

import { OwnerInfo } from "../data/data";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "BDT" ? "BDT" : "USD",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace(/BDT/, "৳");
}

export const Invoice = ({
  order,
  printRef,
}: {
  order: OrderWithItemsAndCustomer;
  printRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const customer = order.customer;
  const orderItems = order.items;

  const columnHelper = createColumnHelper<typeof orderItems[number]>();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
        meta: { className: "w-8 text-muted-foreground" },
      }),
      columnHelper.accessor("productTitle", {
        header: "Item",
        cell: ({ row }) => (
          <div className="min-w-40">
            <div className="leading-tight font-medium">{row.getValue("productTitle")}</div>
          </div>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Qty",
        cell: ({ row }) => <span className="tabular-nums">{row.getValue("quantity")}</span>,
        meta: { className: "text-right w-12" },
      }),
      columnHelper.accessor("unitPrice", {
        header: "Unit",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatCurrency(row.getValue("unitPrice"), row.getValue("currency"))}
          </span>
        ),
        meta: { className: "text-right w-20" },
      }),
      columnHelper.accessor("discountAmount", {
        header: "Discount",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.getValue("discountAmount") === 0
              ? "—"
              : `- ${formatCurrency(row.getValue("discountAmount"), row.getValue("currency"))}`}
          </span>
        ),
        meta: { className: "text-right w-24" },
      }),
      columnHelper.accessor("taxAmount", {
        id: "tax",
        header: "Tax",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.getValue("taxAmount") === 0
              ? "—"
              : formatCurrency(
                  row.getValue("taxAmount"),
                  row.getValue("currency"),
                )}
          </span>
        ),
        meta: { className: "text-right w-20" },
      }),
      columnHelper.accessor("total", {
        id: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(
              row.getValue("total"),
              row.getValue("currency"),
            )}
          </span>
        ),
        meta: { className: "text-right w-24" },
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    data: orderItems,
    columns,
    state: {
      sorting: [] as SortingState,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="print:pt-0">
      <div
        ref={printRef}
        className="bg-background relative mx-auto w-full max-w-4xl rounded-lg border p-6 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none"
      >
        <section className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between print:flex-row print:items-start print:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
            <h2 className="text-muted-foreground text-2xl font-light">
              Order
              {" "}
              <span className="font-medium">{order.id}</span>
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Created:
              {" "}
              {format(order.createdAt ?? "", "MMMM dd, yyyy")}
              {" "}
              · Updated:
              {" "}
              {format(order.updatedAt ?? "", "MMMM dd, yyyy")}
            </p>
          </div>
          <div className="grid gap-2 text-sm md:text-right">
            <div>
              <span className="font-medium">Status:</span>
              {" "}
              <span className="capitalize">{order.status}</span>
            </div>
            <div>
              <span className="font-medium">Payment:</span>
              {" "}
              <span className="capitalize">
                {order.paymentStatus}
                {" "}
                {order.paymentMethod && `(${order.paymentMethod})`}
              </span>
            </div>
            <div>
              <span className="font-medium">Items:</span>
              {" "}
              {orderItems.length}
            </div>
          </div>
        </section>

        <section className="parties-section mt-6 flex justify-between border-b pb-6 print:flex print:justify-between">
          <div className="space-y-1">
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide">
              From
            </h2>
            <p className="font-medium">{OwnerInfo.name}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.address}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.city}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.email}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.phone}</p>
          </div>
          <div className="space-y-1">
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide">
              Bill To
            </h2>

            <p className="font-medium">{customer.name}</p>
            <p className="text-muted-foreground text-xs">
              {customer.address}
            </p>
            <p className="text-muted-foreground text-xs">{customer.city}</p>
            <p className="text-muted-foreground text-xs">
              {customer.email}
            </p>
            <p className="text-muted-foreground text-xs">
              {customer.phone}
            </p>
          </div>
          <div className="space-y-1">
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide">
              Summary
            </h2>
            <p className="text-muted-foreground text-xs">Grand Total</p>
            <p className="font-medium">
              {formatCurrency(order.grandTotal, order.currency)}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <Table className="border-collapse text-sm">
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow
                  key={hg.id}
                  className="bg-muted/50 print:bg-transparent"
                >
                  {hg.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className={
                        // @ts-expect-error className exists
                        header.column.columnDef.meta?.className
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="last:border-b-0">
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={
                        // @ts-expect-error className exists
                        cell.column.columnDef.meta?.className
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="mt-8 flex flex-col gap-4 md:flex-row md:justify-end print:flex-row print:justify-end">
          <div className="w-full max-w-sm space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Subtotal</span>
              <span className="font-medium">
                {formatCurrency(order.itemsTotal, order.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Tax</span>
              <span className="font-medium">
                {formatCurrency(
                  order.itemsTaxTotal,
                  order.currency,
                )}
              </span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">
                  -
                  {formatCurrency(
                    order.discountTotal,
                    order.currency,
                  )}
                </span>
              </div>
            )}
            {order.shipping > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {formatCurrency(order.shipping, order.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base">
              <span className="font-semibold">Grand Total</span>
              <span className="font-semibold">
                {formatCurrency(order.grandTotal, order.currency)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <style>
        {`
        @media print {
          body { background: #fff; }
          header, .print-hidden { display: none !important; }
          main { padding: 0 !important; }
          table th, table td { font-size: 11px; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            .no-break { page-break-inside: avoid; }
          }
          @page { size: A4; margin: 16mm; }
      `}
      </style>
    </div>
  );
};
