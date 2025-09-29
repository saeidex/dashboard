import type { Row } from "@tanstack/react-table";

import { useSuspenseQuery } from "@tanstack/react-query";

import type { Product } from "../data/schema";

import { createCategoryQueryOptions } from "../../product-categories/data/queries";

export const ProductCategoryName = ({ row }: { row: Row<Product> }) => {
  const { data: { name } } = useSuspenseQuery(createCategoryQueryOptions(row.getValue("categoryId")));
  return (
    <div>{name}</div>
  );
};
