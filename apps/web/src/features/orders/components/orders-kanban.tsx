"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import type { ProductionStage } from "@takumitex/api/schema";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import type { Order } from "../data/schema";

import { PRODUCTION_STAGES } from "../data/data";
import { updateOrder } from "../data/queries";
import { KanbanCard } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";

type OrdersKanbanProps = {
  orders: Order[];
};

export function OrdersKanban({ orders }: OrdersKanbanProps) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onMutate: async ({ id, order: data }) => {
      await queryClient.cancelQueries({ queryKey: ["list-orders"] });

      const previousOrders = queryClient.getQueryData(["list-orders"]);
      queryClient.setQueryData(["list-orders"], (old: { rows: Order[] } | undefined) => {
        if (!old)
          return old;
        return {
          ...old,
          rows: old.rows.map((order: Order) =>
            order.id === Number(id)
              ? { ...order, productionStage: data.productionStage, [`${data.productionStage}`]: new Date(),
                }
              : order,
          ),
        };
      });

      return { previousOrders };
    },
    onSuccess: () => {
      toast.success("Order stage updated");
    },
    onError: (_error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(["list-orders"], context.previousOrders);
      }
      toast.error("Failed to update order stage");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["list-orders"] });
    },
  });

  const getOrdersByStage = (stage: ProductionStage) => {
    return orders.filter(order => order.productionStage === stage);
  };

  const handleDragStart = (event: { active: { id: any } }) => {
    const order = orders.find(o => o.id === event.active.id);
    if (order) {
      setActiveOrder(order);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    const order = orders.find(o => o.id === active.id);

    if (!order || !over || typeof over.id !== "string") {
      return;
    }

    const newStage = over.id as ProductionStage;
    if (newStage === order.productionStage || !PRODUCTION_STAGES.some(s => s.id === newStage))
      return;

    const newPartialOrder: Pick<Order, "productionStage"> & Partial<Record<ProductionStage, Date>> = {
      productionStage: newStage,
      [newStage]: new Date(),
    };

    updateMutation.mutate({
      id: order.id.toString(),
      order: newPartialOrder,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {PRODUCTION_STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            orders={getOrdersByStage(stage.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOrder ? <KanbanCard order={activeOrder} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
