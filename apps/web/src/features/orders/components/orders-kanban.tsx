"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { ProductionStage } from "@takumitex/api/schema";

import {
  closestCenter,
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

import { updateOrder } from "../data/queries";
import { KanbanCard } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";

const PRODUCTION_STAGES: {
  id: ProductionStage;
  label: string;
  color: string;
}[] = [
  { id: "confirmed", label: "Confirmed", color: "bg-slate-500" },
  { id: "accessories_inhouse", label: "Accessories Inhouse", color: "bg-blue-500" },
  { id: "china_fabric_etd", label: "China Fabric ETD", color: "bg-green-500" },
  { id: "china_fabric_eta", label: "China Fabric ETA", color: "bg-yellow-500" },
  { id: "fabric_inhouse", label: "Fabric Inhouse", color: "bg-purple-500" },
  { id: "pp_sample", label: "PP Sample", color: "bg-pink-500" },
  { id: "fabric_test_inspection", label: "Fabric Test Inspection", color: "bg-indigo-500" },
  { id: "shipping_sample", label: "Shipping Sample", color: "bg-red-500" },
  { id: "sewing_start", label: "Sewing Start", color: "bg-orange-500" },
  { id: "sewing_complete", label: "Sewing Complete", color: "bg-teal-500" },
  { id: "ken2_inspection_start", label: "Ken2 Inspection Start", color: "bg-cyan-500" },
  { id: "ken2_inspection_finished", label: "Ken2 Inspection Finished", color: "bg-lime-500" },
  { id: "ex_factory", label: "Ex Factory", color: "bg-emerald-500" },
  { id: "port_handover", label: "Port Handover", color: "bg-violet-500" },
];

type OrdersKanbanProps = {
  orders: Order[];
};

export function OrdersKanban({ orders }: OrdersKanbanProps) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateMutation = useMutation({
    mutationFn: updateOrder,
    onMutate: async ({ id, order: data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["list-orders"] });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(["list-orders"]);

      // Optimistically update the cache
      queryClient.setQueryData(["list-orders"], (old: { rows: Order[] } | undefined) => {
        if (!old)
          return old;
        return {
          ...old,
          rows: old.rows.map((order: Order) =>
            order.id === Number(id)
              ? { ...order, productionStage: data.productionStage }
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
      // Rollback on error
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
    console.log("Drag started:", event);
    const { active } = event;
    const order = orders.find(o => o.id === active.id);
    if (order) {
      setActiveOrder(order);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag ended:", event);
    const { active, over } = event;
    setActiveOrder(null);

    if (!over)
      return;

    const newStage = over.id as ProductionStage;
    const orderId = String(active.id);

    const order = orders.find(o => String(o.id) === orderId);
    if (!order || order.productionStage === newStage)
      return;

    // Update with optimistic mutation - map items to only include required fields
    updateMutation.mutate({
      id: orderId,
      order: {
        productionStage: newStage,
        items: order.items.map(item => ({
          id: String(item.id),
        })),
      },
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
