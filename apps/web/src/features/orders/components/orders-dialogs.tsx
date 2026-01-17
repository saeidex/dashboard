import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteOrder, queryKeys } from "../data/queries";
import { OrderPaymentDialog } from "./order-payment-dialog";
import { OrdersActionDialog } from "./orders-action-dialog";
import { useOrders } from "./orders-provider";

export function OrdersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useOrders();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["list-orders"] });
      if (id) {
        queryClient.invalidateQueries(queryKeys.LIST_ORDER(id));
      }
      toast.success("Order deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Error deleting order: ${error.message}`);
    },
  });

  return (
    <>
      <OrdersActionDialog
        key="order-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {/* Payment Dialog for recording payments from orders */}
      <OrderPaymentDialog
        key={`order-pay-${currentRow?.id ?? "new"}`}
        order={currentRow}
        open={open === "pay"}
        onOpenChange={() => {
          setOpen("pay");
          setTimeout(() => {
            setCurrentRow(null);
          }, 500);
        }}
      />

      {currentRow && (
        <>
          <OrdersActionDialog
            key={`order-edit-${currentRow.id}`}
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
              deleteMutation.mutate(currentRow.id.toString());
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
