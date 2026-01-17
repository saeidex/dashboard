import type { ColumnDef } from "@tanstack/react-table";

import { formatDistanceToNow } from "date-fns";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { LongText } from "@/web/components/long-text";
import { Checkbox } from "@/web/components/ui/checkbox";
import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

import { DataTableRowActions } from "./data-table-row-actions";
import { OrderDetailsPageNavigatorButton } from "./order-details-page-navigator-button";
import { OrderExpandToggle } from "./order-expand-toggle";
import { OrderPayButton } from "./order-pay-button";

export const ordersColumns: ColumnDef<Order>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => <OrderExpandToggle row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
    meta: {
      className: cn("w-10 text-center"),
    },
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
          || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    meta: {
      className: cn("sticky md:table-cell start-0 z-10 rounded-tl-[inherit]"),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order ID" />
    ),
    cell: ({ cell, row }) => (
      <OrderDetailsPageNavigatorButton
        id={cell.getValue<Order["id"]>().toString()}
        customerId={row.original.customerId}
      />
    ),
    meta: {
      className: cn(
        "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
        "sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none",
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: "orderStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Status" />
    ),
    cell: ({ cell }) => (
      <div className="font-medium capitalize">
        {String(cell.getValue<Order["orderStatus"]>()).replace(/-/g, " ")}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ cell }) => (
      <div className="font-medium capitalize">
        {String(cell.getValue<Order["paymentStatus"]>()).replace(/-/g, " ")}
      </div>
    ),
  },
  {
    id: "pay",
    header: () => null,
    cell: ({ row }) => <OrderPayButton row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: cn("w-16"),
    },
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ cell }) => (
      <div className="text-xs capitalize">
        {cell.getValue<Order["paymentMethod"]>()
          ? (
              String(cell.getValue<Order["paymentMethod"]>()).replace(/-/g, " ")
            )
          : (
              <span className="opacity-50">-</span>
            )}
      </div>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Total" />
    ),
    cell: ({ cell }) => {
      const total = cell.getValue<Order["grandTotal"]>().toFixed(2);
      return (
        <div className="font-bold">
          ৳
          {total}
        </div>
      );
    },
  },
  {
    accessorKey: "totalPaid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid" />
    ),
    cell: ({ row }) => {
      const totalPaid = row.original.totalPaid ?? 0;
      return (
        <div className="font-medium text-green-600 dark:text-green-400">
          ৳
          {totalPaid.toFixed(2)}
        </div>
      );
    },
  },
  {
    id: "dueAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due" />
    ),
    cell: ({ row }) => {
      const grandTotal = row.original.grandTotal ?? 0;
      const totalPaid = row.original.totalPaid ?? 0;
      const due = Math.max(0, grandTotal - totalPaid);
      return (
        <div className={cn(
          "font-semibold",
          due > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
        )}>
          ৳
          {due.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created at" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Order["createdAt"]>();
      return (
        <div className="text-xs">
          {formatDistanceToNow(date, {
            addSuffix: true,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated at" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Order["updatedAt"]>();
      return (
        <div className="text-xs">
          {formatDistanceToNow(date, {
            addSuffix: true,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ cell }) => (
      <LongText className="max-w-40">
        {cell.getValue<Order["notes"]>() || <span className="opacity-50">-</span>}
      </LongText>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
