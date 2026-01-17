import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deletePayment } from "../data/queries";
import { PaymentsActionDialog } from "./payments-action-dialog";
import { usePayments } from "./payments-provider";

export function PaymentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePayments();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      toast.success("Payment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["list-payments"] });
      queryClient.invalidateQueries({ queryKey: ["list-orders"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete payment");
    },
  });

  return (
    <>
      {currentRow && (
        <>
          <PaymentsActionDialog
            key={`payment-edit-${currentRow.id}`}
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
            key="payment-delete"
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
            title="Delete this payment?"
            desc={(
              <>
                You are about to delete a payment of
                {" "}
                <strong>
                  ৳
                  {currentRow.amount.toLocaleString()}
                </strong>
                {" "}
                for Order #
                {currentRow.orderId}
                .
                <br />
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
