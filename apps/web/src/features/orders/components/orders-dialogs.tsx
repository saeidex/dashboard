import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteOrder, queryKeys } from "../data/queries";
import { OrdersActionDialog } from "./orders-action-dialog";
import { useOrders } from "./orders-provider";

const route = getRouteApi("/_authenticated/orders/");

export function OrdersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useOrders();
  const queryClient = useQueryClient();
  const search = route.useSearch();

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_ORDERS(search));
      toast.success("Order deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Error deleting order: ${error.message}`);
    },
  });

  return (
    <>
      <OrdersActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {currentRow && (
        <>
          <OrdersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={() => {
              setOpen("edit");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="order-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
              deleteMutation.mutate(currentRow.id);
            }}
            className="max-w-md"
            title={`Delete this order: ${currentRow.id} ?`}
            desc={(
              <>
                You are about to delete order
                {" "}
                <strong>{currentRow.id}</strong>
                .
                <br />
                {" "}
                This action cannot be undone.
              </>
            )}
            confirmText="Delete"
          />
        </>
      )}
    </>
  );
}
