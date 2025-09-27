import type { Table } from "@tanstack/react-table";

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
import { sleep } from "@/web/lib/utils";

import { EmployeesMultiDeleteDialog } from "./employees-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkStatusChange = (status: "active" | "inactive") => {
    const Employees = selectedRows.map(row => row.original);
    toast.promise(sleep(2000), {
      loading: `${status === "active" ? "Activating" : "Deactivating"} employees...`,
      success: () => {
        table.resetRowSelection();
        return `${status === "active" ? "Activated" : "Deactivated"} ${Employees.length} employee${Employees.length > 1 ? "s" : ""}`;
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
