import { orderListQueryParamsSchema } from "@crm/api/schema";
import { createFileRoute } from "@tanstack/react-router";

import { Orders } from "@/web/features/orders";

export const Route = createFileRoute("/_authenticated/orders/")({
  validateSearch: orderListQueryParamsSchema,
  component: Orders,
});
