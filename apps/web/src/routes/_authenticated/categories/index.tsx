import { createFileRoute } from "@tanstack/react-router";

import { ProductCagories } from "@/web/features/product-categories";

export const Route = createFileRoute("/_authenticated/categories/")({
  component: ProductCagories,
});
