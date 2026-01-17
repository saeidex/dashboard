import type { ColumnDef } from "@tanstack/react-table";

import { format } from "date-fns/format";
import {
  Banknote,
  Building2,
  CreditCard,
  MoreHorizontal,
  Pencil,
  Smartphone,
  Trash2,
} from "lucide-react";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { LongText } from "@/web/components/long-text";
import { Badge } from "@/web/components/ui/badge";
import { Button } from "@/web/components/ui/button";
import { Checkbox } from "@/web/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/web/components/ui/dropdown-menu";
import { cn } from "@/web/lib/utils";

import type { PaymentWithRelations } from "../data/schema";

import { usePayments } from "./payments-provider";

const paymentMethodIcons: Record<string, React.ReactNode> = {
  "cash": <Banknote className="mr-1 h-4 w-4" />,
  "card": <CreditCard className="mr-1 h-4 w-4" />,
  "bank-transfer": <Building2 className="mr-1 h-4 w-4" />,
  "mobile-wallet": <Smartphone className="mr-1 h-4 w-4" />,
};

const paymentMethodLabels: Record<string, string> = {
  "cash": "Cash",
  "card": "Card",
  "bank-transfer": "Bank Transfer",
  "mobile-wallet": "Mobile Wallet",
};

function DataTableRowActions({
  row,
}: {
  row: { original: PaymentWithRelations };
}) {
  const { setOpen, setCurrentRow } = usePayments();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original);
            setOpen("edit");
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original);
            setOpen("delete");
          }}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const paymentsColumns: ColumnDef<PaymentWithRelations>[] = [
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
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment ID" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-24 ps-3 font-mono text-xs">
        {row.getValue("id")}
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
    accessorKey: "customer.name",
    id: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.customer?.name || "-"}</div>
    ),
  },
  {
    accessorKey: "orderId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order #" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        #
        {row.getValue("orderId")}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="This Payment" />
    ),
    cell: ({ row }) => (
      <div className="w-fit font-semibold text-nowrap text-green-600 dark:text-green-400">
        ৳
        {(row.getValue("amount") as number)?.toLocaleString() || "-"}
      </div>
    ),
  },
  {
    accessorKey: "order.grandTotal",
    id: "orderTotal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Total" />
    ),
    cell: ({ row }) => (
      <div className="w-fit text-nowrap font-medium">
        ৳
        {row.original.order?.grandTotal?.toLocaleString() || "-"}
      </div>
    ),
  },
  {
    accessorKey: "order.totalPaid",
    id: "totalPaid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Paid" />
    ),
    cell: ({ row }) => (
      <div className="w-fit text-nowrap font-medium text-green-600 dark:text-green-400">
        ৳
        {row.original.order?.totalPaid?.toLocaleString() || "0"}
      </div>
    ),
  },
  {
    id: "dueAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Amount" />
    ),
    cell: ({ row }) => {
      const grandTotal = row.original.order?.grandTotal ?? 0;
      const totalPaid = row.original.order?.totalPaid ?? 0;
      const due = Math.max(0, grandTotal - totalPaid);
      return (
        <div
          className={cn(
            "w-fit text-nowrap font-semibold",
            due > 0
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400",
          )}
        >
          ৳
          {due.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Method" />
    ),
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as string;
      return (
        <div className="flex items-center text-sm">
          {paymentMethodIcons[method]}
          {paymentMethodLabels[method] || method}
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reference" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-32 font-mono text-xs">
        {row.getValue("reference") || "-"}
      </LongText>
    ),
  },
  {
    accessorKey: "paidAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("paidAt") as string;
      return (
        <div className="text-sm">
          {date ? format(new Date(date), "MMM dd, yyyy") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-48">{row.getValue("notes") || "-"}</LongText>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    meta: { className: cn("sticky end-0 z-10 rounded-tr-[inherit]") },
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
