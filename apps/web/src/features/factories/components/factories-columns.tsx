import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { LongText } from "@/web/components/long-text";
import { Badge } from "@/web/components/ui/badge";
import { Checkbox } from "@/web/components/ui/checkbox";
import { cn } from "@/web/lib/utils";

import type { Factory } from "../data/schema";

import { DataTableRowActions } from "./data-table-row-actions";

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
};

export const factoriesColumns: ColumnDef<Factory>[] = [
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
        className="translate-y-0.5"
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
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-semibold">{row.getValue("code")}</span>
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Factory Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("city") || "-"}</div>
    ),
  },
  {
    accessorKey: "contactPerson",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Person" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("contactPerson") || "-"}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "totalLines",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lines" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono">
        {row.getValue("totalLines") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "maxManpower",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max Manpower" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono">
        {row.getValue("maxManpower") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacity" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono">
        {row.getValue("capacity") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={statusColors[status] || "secondary"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: false,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-48">{row.getValue("address") || "-"}</LongText>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
