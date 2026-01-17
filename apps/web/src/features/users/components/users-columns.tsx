import type { ColumnDef } from "@tanstack/react-table";

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { LongText } from "@/web/components/long-text";
import { Checkbox } from "@/web/components/ui/checkbox";
import { cn } from "@/web/lib/utils";

import type { User } from "../data/schema";

import { roles } from "../data/data";
import { DataTableRowActions } from "./data-table-row-actions";

export const usersColumns: ColumnDef<User>[] = [
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
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ cell }) => (
      <LongText className="max-w-36 ps-3">
        {cell.getValue<User["id"]>()}
      </LongText>
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
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ cell }) => {
      return (
        <LongText className="max-w-36">
          {cell.getValue<User["name"]>()}
        </LongText>
      );
    },
    meta: { className: "w-36" },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ cell }) => (
      <div className="w-fit text-nowrap">{cell.getValue<User["email"]>()}</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<User["role"]>();
      const userType = roles.find(({ value }) => value === role);

      if (!userType) {
        return null;
      }

      return (
        <div className="flex items-center gap-x-2">
          {userType.icon && (
            <userType.icon size={16} className="text-muted-foreground" />
          )}
          <span className="text-sm capitalize">{role}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "banned",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Banned" />
    ),
    cell: ({ cell }) => {
      return cell.getValue<User["banned"]>() ? "Yes" : "No";
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) ? "Yes" : "No");
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "banReason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ban Reason" />
    ),
    cell: ({ cell }) => {
      return cell.getValue<User["banReason"]>() ?? "-";
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registered At" />
    ),
    cell: ({ cell }) => {
      return formatDistanceToNow(new Date(cell.getValue<User["createdAt"]>()), {
        addSuffix: true,
      });
    },
    meta: { className: "w-36" },
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
