import { createFileRoute } from "@tanstack/react-router";

import { ProductDimensions } from "@/web/features/product-dimensions";

export const Route = createFileRoute("/_authenticated/dimensions/")({
  component: ProductDimensions,
});
