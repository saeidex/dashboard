import type { Row } from "@tanstack/react-table";

import { useSuspenseQuery } from "@tanstack/react-query";

import type { Product } from "../data/schema";

import { categoriesQueryOptions } from "../../product-categories/data/queries";

export const ProductCategoryName = ({ row }: { row: Row<Product> }) => {
  const categoryId = row.getValue("categoryId") as string;
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const category = categories.find(({ id }) => id === Number(categoryId));

  return (
    <div>{category?.name}</div>
  );
};
