"use client";

import type { ProductionStage } from "@takumitex/api/schema";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

import { KanbanCard } from "./kanban-card";

type KanbanColumnProps = {
  stage: {
    id: ProductionStage;
    label: string;
    color: string;
  };
  orders: Order[];
};

export function KanbanColumn({ stage, orders }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalQty = orders.reduce((sum, order) => {
    return (
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    );
  }, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-72 flex-col rounded-lg border bg-primary/10",
        isOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <div className={cn("h-3 w-3 rounded-full", stage.color)} />
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
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        <SortableContext
          items={orders.map(o => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {
            orders.map(order => <KanbanCard key={order.id} order={order} />)
          }
        </SortableContext>
      </div>
    </div>
  );
}
