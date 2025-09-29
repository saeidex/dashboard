import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteExpense, queryKeys } from "../data/queries";
import { ExpensesActionDialog } from "./expenses-action-dialog";
import { useExpenses } from "./expenses-provider";

export function ExpensesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useExpenses();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      queryClient.invalidateQueries(queryKeys.LIST_EXPENSES);
    },
  });

  return (
    <>
      <ExpensesActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {currentRow && (
        <>
          <ExpensesActionDialog
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
            key="expense-delete"
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
            title={`Delete this expense: ${currentRow.id} ?`}
            desc={(
              <>
                You are about to delete a expense with the title
                {" "}
                <strong>{currentRow.title}</strong>
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
