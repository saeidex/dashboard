import type { Row } from "@tanstack/react-table";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Copy, CreditCard, Download, Printer, Trash2, UserPen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/web/components/ui/dropdown-menu";
import { useOrderPrint } from "@/web/hooks/use-order-print";

import type { Order } from "../data/schema";

import { orderStatusValues } from "../data/data";
import { createOrder, queryKeys, updateOrder } from "../data/queries";
import { useOrders } from "./orders-provider";

type DataTableRowActionsProps = {
  row: Row<Order>;
};

const route = getRouteApi("/_authenticated/orders/$customerId");

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useOrders();
  const { printOrder, downloadOrderPdf } = useOrderPrint();

  const queryClient = useQueryClient();
  const search = route.useSearch();

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_ORDERS(search));
      toast.success("Order created successfully.");
    },
    onError: (error) => {
      toast.error(`Error creating order: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_ORDERS());
      toast.success("Order updated successfully");
    },
  });

  const copiedOrder: Order = {
    ...row.original,
    items: row.original.items.map(({ id, ...item }) => ({ ...item, id: crypto.randomUUID() })),
  };

  const handlePrint = () => {
    setCurrentRow(row.original);
    printOrder(row.original);
  };

  const handleDownload = () => {
    setCurrentRow(row.original);
    downloadOrderPdf(row.original);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Order Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                onValueChange={value =>
                  updateMutation.mutate({
                    id: row.original.id.toString(),
                    order: {
                      ...row.original,
                      orderStatus: value as typeof orderStatusValues[number],
                      paymentStatus: row.getValue("paymentStatus"),
                      paymentMethod: row.getValue("paymentMethod"),
                    },
                  })}
                value={row.original.orderStatus ?? undefined}
              >
                {orderStatusValues.map(orderStatus => (
                  <DropdownMenuRadioItem key={orderStatus} value={orderStatus}>
                    {orderStatus.replace(/^./, match => match.toUpperCase())}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Record Payment option - only show for unpaid/partial orders */}
          {row.original.paymentStatus !== "paid" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original);
                  setOpen("pay");
                }}
              >
                Record Payment
                <DropdownMenuShortcut>
                  <CreditCard size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handlePrint}
          >
            Print
            <DropdownMenuShortcut>
              <Printer size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen("edit");
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              createMutation.mutate(copiedOrder);
              setOpen("edit");
            }}
          >
            Copy as new
            <DropdownMenuShortcut>
              <Copy size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDownload}
          >
            Download
            <DropdownMenuShortcut>
              <Download size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen("delete");
            }}
            className="text-red-500!"
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
