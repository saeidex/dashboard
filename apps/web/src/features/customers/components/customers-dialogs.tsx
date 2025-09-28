import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteCustomer, queryKeys } from "../data/queries";
import { CustomersActionDialog } from "./customers-action-dialog";
import { useCustomers } from "./customers-provider";

export function CustomersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_VENDORS);
      toast.success("Customer deleted successfully");
    },
  });

  return (
    <>
      <CustomersActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {currentRow && (
        <>
          <CustomersActionDialog
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
            key="customer-delete"
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
            title={`Delete this customer: ${currentRow.customerId} ?`}
            desc={(
              <>
                You are about to delete a customer with the name
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
