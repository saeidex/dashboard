import type { ColumnDef } from "@tanstack/react-table";

import { format } from "date-fns";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { LongText } from "@/web/components/long-text";
import { Badge } from "@/web/components/ui/badge";
import { Checkbox } from "@/web/components/ui/checkbox";
import { cn } from "@/web/lib/utils";

import type { Employee } from "../data/schema";

import { callTypes } from "../data/data";
import { DataTableRowActions } from "./data-table-row-actions";

export const employeesColumns: ColumnDef<Employee>[] = [
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
    meta: {
      className: "hidden",
    },
    enableHiding: false,
  },
  {
    accessorKey: "employeeId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee ID" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-24 ps-3 font-mono">
        {row.getValue("employeeId")}
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
    accessorFn: row => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original;
      const fullName = `${firstName} ${lastName}`;
      return <LongText className="max-w-36">{fullName}</LongText>;
    },
    meta: { className: "w-36" },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="w-fit text-nowrap">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("position")}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    accessorKey: "shift",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shift" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {row.getValue("shift")}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    accessorKey: "salary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salary" />
    ),
    cell: ({ row }) => {
      const salary = row.getValue("salary") as number;
      return (
        <span>
          ৳
          {salary}
        </span>
      );
    },
    meta: { className: "font-medium" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { status } = row.original;
      const badgeColor = callTypes.get(status);
      return (
        <div className="flex space-x-2">
          <Badge variant="outline" className={cn("capitalize", badgeColor)}>
            {status.replace("-", " ")}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "hireDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hire Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("hireDate") as Date;
      return <div className="text-sm">{format(date, "MMMM dd, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
