import type { Table } from "@tanstack/react-table";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";
import { Button } from "@/web/components/ui/button";

import type { PaymentWithRelations } from "../data/schema";

import { deletePayment } from "../data/queries";

type DataTableBulkActionsProps = {
  table: Table<PaymentWithRelations>;
};

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = selectedRows.map(row =>
        deletePayment(row.original.id),
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      toast.success(`${selectedCount} payment(s) deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["list-payments"] });
      queryClient.invalidateQueries({ queryKey: ["list-orders"] });
      table.resetRowSelection();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete payments");
    },
  });

  if (selectedCount === 0) {
    return null;
  }

  const totalAmount = selectedRows.reduce(
    (sum, row) => sum + row.original.amount,
    0,
  );

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 p-2">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{selectedCount}</span>
        {" "}
        payment(s) selected
        <span className="ml-2 text-xs">
          (Total: ৳
          {totalAmount.toLocaleString()}
          )
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.resetRowSelection()}
        >
          Clear selection
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete selected
        </Button>
      </div>

      <ConfirmDialog
        destructive
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleConfirm={() => {
          setShowDeleteDialog(false);
          deleteMutation.mutate();
        }}
        className="max-w-md"
        title={`Delete ${selectedCount} payment(s)?`}
        desc={(
          <>
            You are about to delete
            {" "}
            <strong>{selectedCount}</strong>
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
      />
    </div>
  );
}
