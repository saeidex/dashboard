import { MoreHorizontal } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/web/components/ui/dropdown-menu";

import type { Dimension } from "../data/schema";

import { useDimensions } from "./dimensions-provider";

type DimensionsActionsProps = {
  dimension: Dimension;
};

export function DimensionsActions({ dimension }: DimensionsActionsProps) {
  const { setCurrentRow, setDialogType } = useDimensions();

  const handleEdit = () => {
    setCurrentRow(dimension);
    setDialogType("update");
  };

  const handleDelete = () => {
    setCurrentRow(dimension);
    setDialogType("delete");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
