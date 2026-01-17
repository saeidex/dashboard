"use client";

import type { ProductionStage } from "@takumitex/api/schema";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ScrollArea } from "@/web/components/ui/scroll-area";
import { cn } from "@/web/lib/utils";
import { useOrdersUiStore } from "@/web/stores/orders-ui-store";

import type { Order } from "../data/schema";

import { KanbanCard } from "./kanban-card";

type KanbanColumnProps = {
  stage: {
    id: ProductionStage;
    label: string;
    color: string;
  };
  orders: Order[];
  isOver?: boolean;
};

export function KanbanColumn({ stage, orders, isOver: isOverFromDndContext = false }: KanbanColumnProps) {
  const { setNodeRef, isOver: isOverFromColumnDroppable } = useDroppable({
    id: stage.id,
  });

  const kanbanLayout = useOrdersUiStore(s => s.kanbanLayout);

  const totalQty = orders.reduce((sum, order) => {
    return (
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    );
  }, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-72 flex-col rounded-lg border bg-secondary/10",
        (isOverFromDndContext || isOverFromColumnDroppable) && "ring-2 ring-primary ring-offset-2",
        kanbanLayout === "line" && "min-h-[77dvh] max-h-[77dvh]",
        kanbanLayout === "grid" && "min-h-80",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          {/* <div className={cn("h-3 w-3 rounded-full", stage.color)} /> */}
          <h3 className="font-semibold">{stage.label}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {orders.length}
          </span>
          {totalQty > 0 && (
            <span className="text-xs">
              {totalQty.toLocaleString()}
              {" "}
              pcs
            </span>
          )}
        </div>
      </div>
      {/* Cards Container */}
      <ScrollArea className="h-full overflow-hidden">
        <SortableContext
          items={orders.map(o => o.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="p-4 space-y-2">
            {
              orders.map(order => <KanbanCard key={order.id} order={order} />)
            }
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
