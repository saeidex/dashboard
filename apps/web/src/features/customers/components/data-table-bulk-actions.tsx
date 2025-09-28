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

import type { Customer } from "../data/schema";

import { queryKeys, updateCustomer } from "../data/queries";
import { CustomersMultiDeleteDialog } from "./customers-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const customers = selectedRows.map(row => row.original as Customer);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateCustomer,
  });

  const handleBulkIsActiveChange = (isActive: boolean) => {
    toast.promise(async () => {
      for (const row of customers) {
        await updateMutation.mutateAsync({ id: row.id, customer: { isActive } });
      }
    }, {
      loading: `${isActive ? "Activating" : "Deactivating"} customers...`,
      success: () => {
        table.resetRowSelection();
        queryClient.invalidateQueries(queryKeys.LIST_VENDORS);

        return `${isActive ? "Activated" : "Deactivated"} ${selectedRows.length} user${selectedRows.length > 1 ? "s" : ""}`;
      },
      error: `Error ${isActive ? "activating" : "deactivating"} customers`,
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="customer">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={updateMutation.isPending}
              variant="outline"
              size="icon"
              onClick={() => handleBulkIsActiveChange(true)}
              className="size-8"
              aria-label="Activate selected customers"
              title="Activate selected customers"
            >
              <UserCheck />
              <span className="sr-only">Activate selected customers</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected customers</p>
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
              aria-label="Deactivate selected customers"
              title="Deactivate selected customers"
            >
              <UserX />
              <span className="sr-only">Deactivate selected customers</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected customers</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected customers"
              title="Delete selected customers"
            >
              <Trash2 />
              <span className="sr-only">Delete selected customers</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected customers</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <CustomersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
