"use client";

import { SizesActionDialog } from "./sizes-actions-dialog";
import { SizesDeleteDialog } from "./sizes-delete-dialog";
import { useSizes } from "./sizes-provider";

export function SizesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSizes();

  const isCreateDialogOpen = open === "create";
  const isUpdateDialogOpen = open === "update";
  const isDeleteDialogOpen = open === "delete";

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <SizesActionDialog
        key="create"
        open={isCreateDialogOpen}
        onOpenChange={handleClose}
      />

      {currentRow && (
        <>
          <SizesActionDialog
            key={`update-${currentRow.id}`}
            open={isUpdateDialogOpen}
            onOpenChange={handleClose}
            currentRow={currentRow}
          />

          <SizesDeleteDialog
            key={`delete-${currentRow.id}`}
            open={isDeleteDialogOpen}
            onOpenChange={handleClose}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
