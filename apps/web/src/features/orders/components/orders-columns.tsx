import type { ColumnDef } from "@tanstack/react-table";

import { format, formatDistanceToNow } from "date-fns";
import { Building2 } from "lucide-react";

import { DataTableColumnHeader } from "@/web/components/data-table";
import { LongText } from "@/web/components/long-text";
import { Badge } from "@/web/components/ui/badge";
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
    cell: ({ cell, row }) => (
      <div className="flex items-center gap-2">
        <div className="font-medium capitalize">
          {String(cell.getValue<Order["paymentStatus"]>()).replace(/-/g, " ")}
        </div>
        <OrderPayButton row={row} />
      </div>
    ),
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
        <div
          className={cn(
            "font-semibold",
            due > 0
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400",
          )}
        >
          ৳
          {due.toFixed(2)}
        </div>
      );
    },
  },
  // Timeline columns (hidden by default)
  {
    accessorKey: "productionStage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stage" />
    ),
    cell: ({ cell }) => {
      const stage = cell.getValue<Order["productionStage"]>();
      const stageConfig: Record<
        string,
        {
          label: string;
          variant: "default" | "secondary" | "destructive" | "outline";
        }
      > = {
        "confirmed": { label: "Confirmed", variant: "outline" },
        "accessories": { label: "Accessories", variant: "secondary" },
        "fabric-transit": { label: "Fabric Transit", variant: "secondary" },
        "fabric-ready": { label: "Fabric Ready", variant: "secondary" },
        "sewing": { label: "Sewing", variant: "default" },
        "inspection": { label: "Inspection", variant: "default" },
        "ex-factory": { label: "Ex-Factory", variant: "default" },
        "delivered": { label: "Delivered", variant: "default" },
      };
      const config = stageConfig[stage] ?? { label: stage, variant: "outline" };
      return (
        <Badge variant={config.variant} className="whitespace-nowrap">
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "factory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Factory" />
    ),
    cell: ({ row }) => {
      const factory = row.original.factory;
      if (!factory) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm truncate max-w-32">{factory.name}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "sewingStartDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sewing Start" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Order["sewingStartDate"]>();
      if (!date)
        return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-xs">{format(new Date(date), "MMM d, yyyy")}</span>
      );
    },
  },
  {
    accessorKey: "sewingCompleteDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sewing End" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Order["sewingCompleteDate"]>();
      if (!date)
        return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-xs">{format(new Date(date), "MMM d, yyyy")}</span>
      );
    },
  },
  {
    accessorKey: "exFactoryDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ex-Factory" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Order["exFactoryDate"]>();
      if (!date)
        return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-xs">{format(new Date(date), "MMM d, yyyy")}</span>
      );
    },
  },
  {
    accessorKey: "portHandoverDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Port Handover" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Order["portHandoverDate"]>();
      if (!date)
        return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-xs">{format(new Date(date), "MMM d, yyyy")}</span>
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
        {cell.getValue<Order["notes"]>() || (
          <span className="opacity-50">-</span>
        )}
      </LongText>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
