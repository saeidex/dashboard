import { createFileRoute } from "@tanstack/react-router";

import { ProductCagories } from "@/web/features/product-categories";
import { categoriesQueryOptions } from "@/web/features/product-categories/data/queries";

export const Route = createFileRoute("/_authenticated/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQueryOptions),
  component: ProductCagories,
});
