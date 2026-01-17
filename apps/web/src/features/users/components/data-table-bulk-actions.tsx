import type { Table } from "@tanstack/react-table";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Mail, Trash2, UserCheck } from "lucide-react";
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

import type { User } from "../data/schema";

import { updateUser } from "../data/queries";
import { UsersMultiDeleteDialog } from "./users-multi-delete-dialog";

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
    mutationFn: updateUser,
  });

  const handleBulkBannedChange = (banned: boolean) => {
    const selectedUsers = selectedRows.map(row => row.original as User);
    toast.promise(
      async () => {
        for (const user of selectedUsers) {
          await updateMutation.mutateAsync({
            id: user.id,
            payload: { banned },
          });
        }
      },
      {
        loading: `${banned ? "Banning" : "Unbanning"} users...`,
        success: () => {
          table.resetRowSelection();
          queryClient.invalidateQueries({ queryKey: ["list-users"] });
          return `${banned ? "Banned" : "Unbanned"} ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`;
        },
        error: `Error ${banned ? "banning" : "unbanning"} users`,
      },
    );
    table.resetRowSelection();
  };

  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map(row => row.original as User);
    toast.promise(sleep(2000), {
      loading: "Inviting users...",
      success: () => {
        table.resetRowSelection();
        return `Invited ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`;
      },
      error: "Error inviting users",
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="user">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkInvite}
              className="size-8"
              aria-label="Invite selected users"
              title="Invite selected users"
              disabled
            >
              <Mail />
              <span className="sr-only">Invite selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Invite selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkBannedChange(true)}
              className="size-8"
              aria-label="UnBan selected users"
              title="UnBan selected users"
            >
              <UserCheck />
              <span className="sr-only">UnBan selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>UnBan selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkBannedChange(false)}
              className="size-8"
              aria-label="Ban selected users"
              title="Ban selected users"
            >
              <Ban />
              <span className="sr-only">Ban selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ban selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected users"
              title="Delete selected users"
            >
              <Trash2 />
              <span className="sr-only">Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
