"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/web/components/ui/alert-dialog";

import type { Dimension } from "../data/schema";

import { deleteDimension, queryKeys } from "../data/queries";

type DimensionsDeleteDialogProps = {
  currentRow: Dimension;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DimensionsDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: DimensionsDeleteDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteDimension,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_DIMENSIONS);
      toast.success("Dimension deleted successfully");
      onOpenChange(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            dimension
            {" "}
            {currentRow.length}
            {" "}
            x
            {" "}
            {currentRow.width}
            {" "}
            x
            {" "}
            {currentRow.height}
            {" "}
            {currentRow.unit}
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteMutation.mutate(currentRow.id);
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
