import type { ColumnDef } from "@tanstack/react-table";

import { getRouteApi } from "@tanstack/react-router";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { Badge } from "@/web/components/ui/badge";
import { Checkbox } from "@/web/components/ui/checkbox";

import type { Product } from "../data/schema.ts";

import { labels, statuses } from "../data/data";
import { DataTableRowActions } from "./data-table-row-actions";

const categories = getRouteApi("/_authenticated/categories/").useLoaderData();

export const productsColumns: ColumnDef<Product>[] = [
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
    accessorKey: "productId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[96px] font-mono text-xs">
        {row.getValue("productId")}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels.find(l => l.value === row.original.label);
      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        status => status.value === row.getValue("status"),
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center gap-2">
          {status.icon && (
            <status.icon className="text-muted-foreground size-4" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "categoryId",
    accessorFn: row => row.categoryId,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const name
        = categories.find(c => c.id === row.getValue("categoryId"))?.name || "";
      return <span className="truncate">{name}</span>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.original.total ?? 0;
      return (
        <span className="font-mono font-semibold">
          ৳
          {price.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "basePrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Base Price" />
    ),
    cell: ({ row }) => {
      const base = row.original.basePrice ?? 0;
      return (
        <span className="text-muted-foreground">
          ৳
          {base.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "discountAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discount" />
    ),
    cell: ({ row }) => {
      const amt = row.original.discountAmount ?? 0;
      const pct = row.original.discountPercentage ?? 0;
      if (!amt)
        return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-xs text-red-400">
          -৳
          {amt.toFixed(2)}
          {" "}
          (
          {pct}
          %)
        </span>
      );
    },
  },
  {
    accessorKey: "taxAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tax" />
    ),
    cell: ({ row }) => {
      const taxAmount = row.original.taxAmount ?? 0;
      const taxPct = row.original.taxPercentage ?? 0;
      return (
        <span className="font-mono text-xs">
          ৳
          {taxAmount.toFixed(2)}
          {" "}
          (
          {taxPct}
          %)
        </span>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue<number>("stock");
      return <span>{stock}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
