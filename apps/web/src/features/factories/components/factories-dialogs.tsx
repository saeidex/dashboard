import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteFactory, queryKeys } from "../data/queries";
import { FactoriesActionDialog } from "./factories-action-dialog";
import { useFactories } from "./factories-provider";

export function FactoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useFactories();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteFactory,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_FACTORIES);
      toast.success("Factory deleted successfully");
    },
  });

  return (
    <>
      <FactoriesActionDialog
        key="factory-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {currentRow && (
        <>
          <FactoriesActionDialog
            key={`factory-edit-${currentRow.id}`}
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
            key="factory-delete"
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
            title={`Delete factory: ${currentRow.name}?`}
            desc={(
              <>
                You are about to delete the factory
                {" "}
                <strong>{currentRow.name}</strong>
                {" "}
                (Code:
                {currentRow.code}
                ).
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
