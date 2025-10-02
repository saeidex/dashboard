import type { Row } from "@tanstack/react-table";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

type OrderExpandToggleProps = {
  row: Row<Order>;
};

export function OrderExpandToggle({ row }: OrderExpandToggleProps) {
  const canExpand = row.getCanExpand();
  const isExpanded = row.getIsExpanded();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={row.getToggleExpandedHandler()}
      aria-label={isExpanded ? "Collapse row" : "Expand row"}
      disabled={!canExpand}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-transparent transition",
        canExpand
          ? "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          : "opacity-20",
      )}
    >
      {canExpand
        ? (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded ? "rotate-0" : "-rotate-90",
              )}
            />
          )
        : (
            <ChevronRight className="h-4 w-4" />
          )}
    </Button>
  );
}
