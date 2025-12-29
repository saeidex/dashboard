/* eslint-disable unicorn/filename-case */
import { createFileRoute } from "@tanstack/react-router";

import { orderListQueryParamsSchema } from "@/api/db/schema";
import { CustomerOrders } from "@/web/features/orders/customer-orders";

export const Route = createFileRoute("/_authenticated/orders/$customerId/")({
  validateSearch: orderListQueryParamsSchema,
  component: CustomerOrders,
});
