import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";

import { deleteEmployee, queryKeys } from "../data/queries";
import { EmployeesActionDialog } from "./employees-action-dialog";
import { useEmployees } from "./employees-provider";

export function EmployeesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useEmployees();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      setCurrentRow(null);
      setOpen(null);
      queryClient.invalidateQueries(queryKeys.LIST_EMPLOYEES);
      toast.success("Employee deleted successfully");
    },
  });

  return (
    <>
      <EmployeesActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={() => setOpen("add")}
      />

      {currentRow && (
        <>
          <EmployeesActionDialog
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
            key="employee-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => deleteMutation.mutate(currentRow.id)}
            disabled={deleteMutation.isPending}
            className="max-w-md"
            title={`Delete this employee: ${currentRow.employeeId} ?`}
            desc={(
              <>
                You are about to delete a employee with the Employee Name
                {" "}
                <strong>{`${currentRow.firstName} ${currentRow.lastName}`}</strong>
                .
                {" "}
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
