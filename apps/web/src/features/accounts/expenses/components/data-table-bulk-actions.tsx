import type { Table } from "@tanstack/react-table";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { DataTableBulkActions as BulkActionsToolbar } from "@/web/components/data-table";
import { Button } from "@/web/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";

import { ExpensesMultiDeleteDialog } from "./expenses-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <BulkActionsToolbar table={table} entityName="expense">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected expenses"
              title="Delete selected expenses"
            >
              <Trash2 />
              <span className="sr-only">Delete selected expenses</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected expenses</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ExpensesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
