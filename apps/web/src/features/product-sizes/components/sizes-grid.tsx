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
import { useMemo, useState } from "react";

import { Badge } from "@/web/components/ui/badge";
import { Card, CardContent } from "@/web/components/ui/card";

import type { Size } from "../data/schema";

import { sizesQueryOptions } from "../data/queries";
import { SizesActions } from "./sizes-actions";

type SortableSizeCardProps = {
  size: Size;
};

function SortableSizeCard({ size }: SortableSizeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: size.id });

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
                {size.unit}
              </Badge>
              <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <SizesActions size={size} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xl font-semibold text-foreground">
                {size.length}
                {" "}
                ×
                {" "}
                {size.width}
                {" "}
                ×
                {" "}
                {size.height}
              </div>
              {size.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {size.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SizesGrid() {
  const { data: sizes } = useQuery(sizesQueryOptions);
  const [items, setItems] = useState<Size[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Update items when data changes or initialize
  const displayItems = useMemo(() => {
    if (!sizes)
      return [];
    if (items.length === 0)
      return sizes;

    // If the data changed (e.g., new item added), merge it
    const itemIds = new Set(items.map(i => i.id));
    const newItems = sizes.filter(dim => !itemIds.has(dim.id));

    if (newItems.length > 0) {
      return [...items, ...newItems];
    }

    return items;
  }, [sizes, items]);

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

  if (!sizes || sizes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No sizes found</p>
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
          {displayItems.map(size => (
            <SortableSizeCard key={size.id} size={size} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
