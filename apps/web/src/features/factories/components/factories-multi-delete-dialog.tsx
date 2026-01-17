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

import { deleteFactory, queryKeys } from "../data/queries";

type FactoriesMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function FactoriesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: FactoriesMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteFactory,
  });

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    onOpenChange(false);

    toast.promise(
      async () => {
        for (const row of selectedRows) {
          await deleteMutation.mutateAsync(row.getValue("id"));
        }
      },
      {
        loading: "Deleting factories...",
        success: () => {
          table.resetRowSelection();
          queryClient.invalidateQueries(queryKeys.LIST_FACTORIES);

          return `Deleted ${selectedRows.length} ${
            selectedRows.length > 1 ? "factories" : "factory"
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
          selected
          {" "}
          {selectedRows.length > 1 ? "factories" : "factory"}
          ?
        </span>
      )}
      desc={(
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. All selected factories will be
              permanently deleted.
            </AlertDescription>
          </Alert>
          <p className="text-muted-foreground mb-2">
            Please type
            {" "}
            <strong>{CONFIRM_WORD}</strong>
            {" "}
            to confirm deletion:
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-delete" className="sr-only">
              Type DELETE to confirm
            </Label>
            <Input
              id="confirm-delete"
              placeholder={`Type ${CONFIRM_WORD} to confirm`}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </div>
        </div>
      )}
      confirmText="Delete Factories"
      destructive
    />
  );
}
