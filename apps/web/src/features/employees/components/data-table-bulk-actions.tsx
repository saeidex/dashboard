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

import { queryKeys, updateEmployee } from "../data/queries";
import { EmployeesMultiDeleteDialog } from "./employees-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
  });

  const handleBulkStatusChange = (status: "active" | "inactive") => {
    toast.promise(async () => {
      for (const employee of selectedRows) {
        await updateMutation.mutateAsync({ id: employee.getValue("id"), employee: { status } });
      }
    }, {
      loading: `${status === "active" ? "Activating" : "Deactivating"} employees...`,
      success: () => {
        table.resetRowSelection();
        queryClient.invalidateQueries(queryKeys.LIST_EMPLOYEES);
        return `${status === "active" ? "Activated" : "Deactivated"} ${selectedRows.length} employee${selectedRows.length > 1 ? "s" : ""}`;
      },
      error: `Error ${status === "active" ? "activating" : "deactivating"} employees`,
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="employee">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange("active")}
              className="size-8"
              aria-label="Activate selected employees"
              title="Activate selected employees"
            >
              <UserCheck />
              <span className="sr-only">Activate selected employees</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected employees</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange("inactive")}
              className="size-8"
              aria-label="Deactivate selected employees"
              title="Deactivate selected employees"
            >
              <UserX />
              <span className="sr-only">Deactivate selected employees</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected employees</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected employees"
              title="Delete selected employees"
            >
              <Trash2 />
              <span className="sr-only">Delete selected employees</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected employees</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <EmployeesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
