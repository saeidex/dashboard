import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import type { PaymentWithRelations } from "../data/schema";

import { deletePayment } from "../data/queries";

type PaymentsMultiDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payments: PaymentWithRelations[];
  onSuccess?: () => void;
};

export function PaymentsMultiDeleteDialog({
  open,
  onOpenChange,
  payments,
  onSuccess,
}: PaymentsMultiDeleteDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = payments.map(payment =>
        deletePayment(payment.id),
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      toast.success(`${payments.length} payment(s) deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["list-payments"] });
      queryClient.invalidateQueries({ queryKey: ["list-orders"] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete payments");
    },
  });

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      className="max-w-md"
      title={`Delete ${payments.length} payment(s)?`}
      desc={(
        <>
          You are about to delete
          {" "}
          <strong>{payments.length}</strong>
          {" "}
          payment(s) with a total of
          {" "}
          <strong>
            ৳
            {totalAmount.toLocaleString()}
          </strong>
          .
          <br />
          This action cannot be undone.
        </>
      )}
      confirmText="Delete"
      isLoading={deleteMutation.isPending}
    />
  );
}
