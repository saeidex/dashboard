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

import { Card, CardContent } from "@/web/components/ui/card";

import type { Category } from "../data/schema";

import { categoriesQueryOptions } from "../data/queries";
import { CategoryActions } from "./category-actions";

type SortableCategoryCardProps = {
  category: Category;
};

function SortableCategoryCard({ category }: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

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
      <Card className="group overflow-hidden p-0 transition-shadow duration-300 hover:shadow-lg cursor-grab active:cursor-grabbing">
        <CardContent className="p-0">
          <div
            className="relative h-48 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${category.image})` }}
          >
            <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
            <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <CategoryActions category={category} />
            </div>
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-lg font-semibold text-white drop-shadow-lg">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-white/90 drop-shadow-lg">
                {category.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const CategoriesGrid = () => {
  const { data: productCategories } = useQuery(categoriesQueryOptions);
  const [items, setItems] = useState<Category[]>([]);

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
    if (!productCategories)
      return [];
    if (items.length === 0)
      return productCategories;

    // If the data changed (e.g., new item added), merge it
    const itemIds = new Set(items.map(i => i.id));
    const newItems = productCategories.filter(cat => !itemIds.has(cat.id));

    if (newItems.length > 0) {
      return [...items, ...newItems];
    }

    return items;
  }, [productCategories, items]);

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

  if (!productCategories || productCategories.length === 0) {
    return <p className="text-muted-foreground">No categories found.</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={displayItems.map(item => item.id)}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayItems.map(category => (
            <SortableCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
