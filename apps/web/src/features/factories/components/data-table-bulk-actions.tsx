import type { Table } from "@tanstack/react-table";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTableBulkActions as BulkActionsToolbar } from "@/web/components/data-table";
import { Button } from "@/web/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";

import type { Factory } from "../data/schema";

import { queryKeys, updateFactory } from "../data/queries";
import { FactoriesMultiDeleteDialog } from "./factories-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const factories = selectedRows.map(row => row.original as Factory);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateFactory,
  });

  const handleBulkStatusChange = (status: "active" | "inactive") => {
    toast.promise(
      async () => {
        for (const row of factories) {
          await updateMutation.mutateAsync({ id: row.id, factory: { status } });
        }
      },
      {
        loading: `${status === "active" ? "Activating" : "Deactivating"} factories...`,
        success: () => {
          table.resetRowSelection();
          queryClient.invalidateQueries(queryKeys.LIST_FACTORIES);

          return `${status === "active" ? "Activated" : "Deactivated"} ${selectedRows.length} factor${selectedRows.length > 1 ? "ies" : "y"}`;
        },
        error: `Error ${status === "active" ? "activating" : "deactivating"} factories`,
      },
    );
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="factory">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={updateMutation.isPending}
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange("active")}
              className="size-8"
              aria-label="Activate selected factories"
              title="Activate selected factories"
            >
              <Power />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected factories</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={updateMutation.isPending}
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange("inactive")}
              className="size-8"
              aria-label="Deactivate selected factories"
              title="Deactivate selected factories"
            >
              <PowerOff />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected factories</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected factories"
              title="Delete selected factories"
            >
              <Trash2 className="text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected factories</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>
      <FactoriesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  );
}
