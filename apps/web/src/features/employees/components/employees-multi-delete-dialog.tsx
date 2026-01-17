"use client";

import type { Table } from "@tanstack/react-table";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/web/components/ui/alert";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";

import { deleteEmployee, queryKeys } from "../data/queries";

type EmployeesMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function EmployeesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: EmployeesMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
  });

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    onOpenChange(false);

    toast.promise(
      async () => {
        for (const employee of selectedRows) {
          await deleteMutation.mutateAsync(employee.getValue("id"));
        }
      },
      {
        loading: "Deleting employees...",
        success: () => {
          table.resetRowSelection();
          queryClient.invalidateQueries(queryKeys.LIST_EMPLOYEES);
          return `Deleted ${selectedRows.length} ${
            selectedRows.length > 1 ? "employees" : "employee"
          }`;
        },
        error: "Error",
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={(
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />
          {" "}
          Delete
          {" "}
          {selectedRows.length}
          {" "}
          {selectedRows.length > 1 ? "employees" : "employee"}
        </span>
      )}
      desc={(
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected employees?
            {" "}
            <br />
            This action cannot be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">
              Confirm by typing "
              {CONFIRM_WORD}
              ":
            </span>
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      )}
      confirmText="Delete"
      destructive
    />
  );
}
