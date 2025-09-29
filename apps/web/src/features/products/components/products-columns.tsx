import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { Badge } from "@/web/components/ui/badge";
import { Checkbox } from "@/web/components/ui/checkbox";

import type { Product } from "../data/schema.ts";

import { labels, statuses } from "../data/data";
import { DataTableRowActions } from "./data-table-row-actions";
import { ProductCategoryName } from "./product-category-name.tsx";

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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ cell }) => {
      const label = labels.find(l => l.value === cell.getValue<Product["label"]>());
      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {cell.getValue<Product["label"]>()}
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
    cell: ({ cell }) => {
      const status = statuses.find(
        status => status.value === cell.getValue<Product["status"]>(),
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
    cell: ProductCategoryName,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ cell }) => {
      const price = cell.getValue<Product["total"]>();
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
    cell: ({ cell }) => {
      const base = cell.getValue<Product["basePrice"]>();
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
    cell: ({ cell }) => {
      const amt = cell.getValue<Product["discountAmount"]>();
      const pct = cell.getValue<Product["discountPercentage"]>();
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
    cell: ({ cell }) => {
      const taxAmount = cell.getValue<Product["taxAmount"]>();
      const taxPct = cell.getValue<Product["taxPercentage"]>();
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
    cell: ({ cell }) => {
      const stock = cell.getValue<Product["stock"]>();
      return <span>{stock}</span>;
    },
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
