import { FilePlus, Kanban, LayoutGrid, Rows3, Table } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/web/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";

import { useOrders } from "./orders-provider";

type OrdersPrimaryButtonsProps = {
  view?: "table" | "kanban";
  onViewChange?: (view: "table" | "kanban") => void;
  kanbanLayout?: "grid" | "line";
  onKanbanLayoutChange?: (layout: "grid" | "line") => void;
};

export function OrdersPrimaryButtons({
  view = "table",
  onViewChange,
  kanbanLayout = "line",
  onKanbanLayoutChange,
}: OrdersPrimaryButtonsProps) {
  const { setOpen } = useOrders();
  return (
    <div className="flex items-center gap-3">
      {onViewChange && (
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value)
              onViewChange(value as "table" | "kanban");
          }}
          className="bg-muted rounded-lg p-1"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem
                  value="table"
                  aria-label="Table view"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Table className="h-4 w-4" />
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>Table View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem
                  value="kanban"
                  aria-label="Kanban view"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Kanban className="h-4 w-4" />
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>Kanban Board</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      )}

      {view === "kanban" && onKanbanLayoutChange && (
        <ToggleGroup
          type="single"
          value={kanbanLayout}
          onValueChange={(value) => {
            if (value)
              onKanbanLayoutChange(value as "grid" | "line");
          }}
          className="bg-muted rounded-lg p-1"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid layout"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>Grid Layout</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem
                  value="line"
                  aria-label="Line layout"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Rows3 className="h-4 w-4" />
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>Line Layout</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      )}

      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <span>Add Order</span>
        {" "}
        <FilePlus size={18} />
      </Button>
    </div>
  );
}
