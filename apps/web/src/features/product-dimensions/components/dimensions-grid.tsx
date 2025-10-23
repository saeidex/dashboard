import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/web/components/ui/badge";
import { Card, CardContent } from "@/web/components/ui/card";

import type { Dimension } from "../data/schema";

import { dimensionsQueryOptions } from "../data/queries";
import { DimensionsActions } from "./dimensions-actions";

type SortableDimensionCardProps = {
  dimension: Dimension;
};

function SortableDimensionCard({ dimension }: SortableDimensionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dimension.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-grab active:cursor-grabbing">
        <CardContent className="p-5 py-2">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <Badge variant="secondary" className="text-xs font-medium">
                {dimension.unit}
              </Badge>
              <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <DimensionsActions dimension={dimension} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xl font-semibold text-foreground">
                {dimension.length}
                {" "}
                ×
                {" "}
                {dimension.width}
                {" "}
                ×
                {" "}
                {dimension.height}
              </div>
              {dimension.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {dimension.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DimensionsGrid() {
  const { data: dimensions } = useQuery(dimensionsQueryOptions);
  const [items, setItems] = useState<Dimension[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Update items when data changes or initialize
  const displayItems = useMemo(() => {
    if (!dimensions)
      return [];
    if (items.length === 0)
      return dimensions;

    // If the data changed (e.g., new item added), merge it
    const itemIds = new Set(items.map(i => i.id));
    const newItems = dimensions.filter(dim => !itemIds.has(dim.id));

    if (newItems.length > 0) {
      return [...items, ...newItems];
    }

    return items;
  }, [dimensions, items]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const itemsToUse = currentItems.length > 0 ? currentItems : displayItems;
        const oldIndex = itemsToUse.findIndex(item => item.id === active.id);
        const newIndex = itemsToUse.findIndex(item => item.id === over.id);

        return arrayMove(itemsToUse, oldIndex, newIndex);
      });
    }
  };

  if (!dimensions || dimensions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No dimensions found</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={displayItems.map(item => item.id)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayItems.map(dimension => (
            <SortableDimensionCard key={dimension.id} dimension={dimension} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
