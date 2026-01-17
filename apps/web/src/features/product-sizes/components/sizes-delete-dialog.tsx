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

import type { Size } from "../data/schema";

import { deleteSize, queryKeys } from "../data/queries";

type SizesDeleteDialogProps = {
  currentRow: Size;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SizesDeleteDialog({
  currentRow,
  open,
  onOpenChange,
}: SizesDeleteDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteSize,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.LIST_DIMENSIONS);
      toast.success("Size deleted successfully");
      onOpenChange(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the size
            {" "}
            {currentRow.length}
            {" "}
            x
            {currentRow.width}
            {" "}
            x
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
