import type { ColumnDef } from "@tanstack/react-table";

import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { LongText } from "@/web/components/long-text";
import { Checkbox } from "@/web/components/ui/checkbox";
import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

import { DataTableRowActions } from "./data-table-row-actions";

export const OrdersColumns = () => {
  const navigate = useNavigate();

  return useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
              || (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={value =>
              table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
      },
      {
        accessorKey: "orderNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order #" />
        ),
        cell: ({ row }) => (
          <span
            onClick={() =>
              navigate({
                to: "/orders/$orderNumber",
                params: { orderNumber: row.original.orderNumber },
              })}
            className="cursor-pointer"
          >
            <LongText className="max-w-40 ps-3 font-mono">
              {row.original.orderNumber}
            </LongText>
          </span>
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
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <div className="font-medium capitalize">
            {String(row.getValue("status")).replace(/-/g, " ")}
          </div>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment" />
        ),
        cell: ({ row }) => (
          <div className="font-medium capitalize">
            {String(row.getValue("paymentStatus")).replace(/-/g, " ")}
          </div>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Method" />
        ),
        cell: ({ row }) => (
          <div className="text-xs capitalize">
            {row.getValue("paymentMethod")
              ? (
                  String(row.getValue("paymentMethod")).replace(/-/g, " ")
                )
              : (
                  <span className="opacity-50">-</span>
                )}
          </div>
        ),
      },
      {
        id: "itemsCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Items" />
        ),
        cell: ({ row }) => {
          const items = row.original.items;
          return <div className="text-center">{items.length}</div>;
        },
      },
      {
        accessorKey: "totals.grandTotal",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => {
          const total = (row.original.totals?.grandTotal ?? 0).toFixed(2);
          return (
            <div className="font-bold">
              ৳
              {total}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("createdAt") as Date;
          return <div className="text-xs">{date.toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: "notes",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Notes" />
        ),
        cell: ({ row }) => (
          <LongText className="max-w-40">
            {row.getValue("notes") || <span className="opacity-50">-</span>}
          </LongText>
        ),
        enableSorting: false,
      },
      {
        id: "actions",
        cell: DataTableRowActions,
      },
    ],
    [navigate],
  );
};
