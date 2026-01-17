"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/web/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/web/components/ui/alert";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";

import type { User } from "../data/schema";

import { deleteUser, queryKeys } from "../data/queries";

type UserDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: User;
};

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState("");

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_USERS);
      toast.success("User deleted successfully.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(
        error?.message
        || "There was an error deleting the user. Please try again.",
      );
    },
  });

  const handleDelete = () => {
    if (value.trim() !== currentRow.email)
      return;

    deleteMutation.mutate(currentRow.id);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email || deleteMutation.isPending}
      title={(
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />
          {" "}
          Delete User
        </span>
      )}
      desc={(
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete
            {" "}
            <span className="font-bold">{currentRow.name}</span>
            ?
            <br />
            This action will permanently remove the user with the email of
            {" "}
            <span className="font-bold">{currentRow.email}</span>
            {" "}
            from the
            system. This cannot be undone.
          </p>

          <Label className="my-2">
            Email:
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter email to confirm deletion."
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
