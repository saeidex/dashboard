"use client";

import { DimensionsActionDialog } from "./dimensions-actions-dialog";
import { DimensionsDeleteDialog } from "./dimensions-delete-dialog";
import { useDimensions } from "./dimensions-provider";

export function DimensionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useDimensions();

  const isCreateDialogOpen = open === "create";
  const isUpdateDialogOpen = open === "update";
  const isDeleteDialogOpen = open === "delete";

  const handleClose = () => {
    setOpen(null);
    setCurrentRow(null);
  };

  return (
    <>
      <DimensionsActionDialog
        key="create"
        open={isCreateDialogOpen}
        onOpenChange={handleClose}
      />

      {currentRow && (
        <>
          <DimensionsActionDialog
            key={`update-${currentRow.id}`}
            open={isUpdateDialogOpen}
            onOpenChange={handleClose}
            currentRow={currentRow}
          />

          <DimensionsDeleteDialog
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
