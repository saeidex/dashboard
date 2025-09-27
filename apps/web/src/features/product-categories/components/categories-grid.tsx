import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/web/components/ui/card";

import { categoriesQueryOptions } from "../data/queries";
import { CategoryActions } from "./category-actions";

export const CategoriesGrid = () => {
  const { data: productCategories } = useQuery(categoriesQueryOptions);

  if (!productCategories || productCategories.length === 0) {
    return <p className="text-muted-foreground">No categories found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productCategories.map(category => (
        <Card
          key={category.name}
          className="group overflow-hidden p-0 transition-shadow duration-300 hover:shadow-lg"
        >
          <CardContent className="p-0">
            <div
              className="relative h-48 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${category.image})` }}
            >
              <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
              <div className="absolute top-3 right-3 opacity-0 transition-colors duration-200 group-hover:opacity-100">
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
      ))}
    </div>
  );
};
