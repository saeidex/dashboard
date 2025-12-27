import { createFileRoute } from "@tanstack/react-router";

import { ProductSizes } from "@/web/features/product-sizes";

export const Route = createFileRoute("/_authenticated/sizes/")({
  component: ProductSizes,
});
