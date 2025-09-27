import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteCategory, queryKeys } from "../data/queries";
import { CategoriesActionDialog } from "./categories-actions-dialog";
import { useCategories } from "./categories-provider";

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setOpen(null);
      queryClient.invalidateQueries(queryKeys.LIST_CATEGORIES);
      toast.success("Category deleted successfully");
    },
  });

  return (
    <>
      <CategoriesActionDialog
        key="category-create"
        open={open === "create"}
        onOpenChange={() => setOpen("create")}
      />
      {currentRow && (
        <>
          <CategoriesActionDialog
            key={`category-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="category-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => deleteMutation.mutate(currentRow.id)}
            className="max-w-md"
            title={`Delete this category: ${currentRow.name} ?`}
            desc={(
              <>
                You are about to delete a category with the ID
                {" "}
                <strong>{currentRow.id}</strong>
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
