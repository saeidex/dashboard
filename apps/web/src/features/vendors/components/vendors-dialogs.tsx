import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteVendor, queryKeys } from "../data/queries";
import { VendorsActionDialog } from "./vendors-action-dialog";
import { useVendors } from "./vendors-provider";

export function VendorsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useVendors();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_VENDORS);
      toast.success("Vendor deleted successfully");
    },
  });

  return (
    <>
      <VendorsActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {currentRow && (
        <>
          <VendorsActionDialog
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
            key="vendor-delete"
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
            title={`Delete this vendor: ${currentRow.vendorId} ?`}
            desc={(
              <>
                You are about to delete a vendor with the name
                {" "}
                <strong>{currentRow.name}</strong>
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
