/* eslint-disable unicorn/filename-case */
import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailPage } from "@/web/features/orders/order-detail-page";

export const Route = createFileRoute("/_authenticated/orders/$customerId/$id")({
  component: OrderDetailPage,
});
