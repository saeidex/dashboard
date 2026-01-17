"use client";

import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import type { ProductionStage } from "@takumitex/api/schema";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
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
  const [overStage, setOverStage] = useState<ProductionStage | null>(null);
  const queryClient = useQueryClient();

  const stageOrder = PRODUCTION_STAGES.map(s => s.id);
  const getStageIndex = (stage: ProductionStage | null | undefined) => {
    if (!stage)
      return -1;
    return stageOrder.indexOf(stage);
  };
  const getNextStage = (stage: ProductionStage) => {
    const idx = getStageIndex(stage);
    if (idx < 0)
      return null;
    return stageOrder[idx + 1] ?? null;
  };

  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0)
      return pointerCollisions;

    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0)
      return rectCollisions;

    return closestCorners(args);
  };

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

  const handleDragStart = (event: DragStartEvent) => {
    const order = orders.find(o => o.id === event.active.id);
    if (order)
      setActiveOrder(order);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverStage(null);
      return;
    }

    let desiredStage: ProductionStage | null = null;
    if (typeof over.id === "string") {
      desiredStage = over.id as ProductionStage;
    }
    else {
      const overOrder = orders.find(o => o.id === over.id);
      desiredStage = overOrder?.productionStage ?? null;
    }

    const activeStage = activeOrder?.productionStage;
    if (!activeStage || !desiredStage) {
      setOverStage(null);
      return;
    }

    const activeIdx = getStageIndex(activeStage);
    const desiredIdx = getStageIndex(desiredStage);
    const nextStage = getNextStage(activeStage);

    if (nextStage && desiredIdx > activeIdx) {
      setOverStage(nextStage);
    }
    else {
      setOverStage(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);
    setOverStage(null);

    const order = orders.find(o => o.id === active.id);

    if (!order || !over)
      return;

    let newStage: ProductionStage | null = null;
    if (typeof over.id === "string") {
      newStage = over.id as ProductionStage;
    }
    else {
      const overOrder = orders.find(o => o.id === over.id);
      newStage = overOrder?.productionStage ?? null;
    }

    if (!newStage)
      return;

    // Restrict: only allow moving one column to the right (next stage).
    // Disallow moving left and disallow skipping stages.
    const nextStage = getNextStage(order.productionStage);
    if (!nextStage)
      return;
    const currentIdx = getStageIndex(order.productionStage);
    const targetIdx = getStageIndex(newStage);
    if (targetIdx <= currentIdx)
      return;

    newStage = nextStage;
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
      collisionDetection={collisionDetection}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveOrder(null);
        setOverStage(null);
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {PRODUCTION_STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            orders={getOrdersByStage(stage.id)}
            isOver={overStage === stage.id}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOrder ? <KanbanCard order={activeOrder} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
