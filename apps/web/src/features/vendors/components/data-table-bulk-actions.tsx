import type { Table } from "@tanstack/react-table";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTableBulkActions as BulkActionsToolbar } from "@/web/components/data-table";
import { Button } from "@/web/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";

import type { Vendor } from "../data/schema";

import { queryKeys, updateVendor } from "../data/queries";
import { VendorsMultiDeleteDialog } from "./vendors-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const vendors = selectedRows.map(row => row.original as Vendor);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateVendor,
  });

  const handleBulkIsActiveChange = (isActive: boolean) => {
    toast.promise(async () => {
      for (const row of vendors) {
        await updateMutation.mutateAsync({ id: row.id, vendor: { isActive } });
      }
    }, {
      loading: `${isActive ? "Activating" : "Deactivating"} vendors...`,
      success: () => {
        table.resetRowSelection();
        queryClient.invalidateQueries(queryKeys.LIST_VENDORS);

        return `${isActive ? "Activated" : "Deactivated"} ${selectedRows.length} user${selectedRows.length > 1 ? "s" : ""}`;
      },
      error: `Error ${isActive ? "activating" : "deactivating"} vendors`,
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="vendor">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={updateMutation.isPending}
              variant="outline"
              size="icon"
              onClick={() => handleBulkIsActiveChange(true)}
              className="size-8"
              aria-label="Activate selected vendors"
              title="Activate selected vendors"
            >
              <UserCheck />
              <span className="sr-only">Activate selected vendors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected vendors</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={updateMutation.isPending}
              variant="outline"
              size="icon"
              onClick={() => handleBulkIsActiveChange(false)}
              className="size-8"
              aria-label="Deactivate selected vendors"
              title="Deactivate selected vendors"
            >
              <UserX />
              <span className="sr-only">Deactivate selected vendors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected vendors</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected vendors"
              title="Delete selected vendors"
            >
              <Trash2 />
              <span className="sr-only">Delete selected vendors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected vendors</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <VendorsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
