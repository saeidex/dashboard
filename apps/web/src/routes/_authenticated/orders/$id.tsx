import { createFileRoute } from "@tanstack/react-router";

import { OrderDetailPage } from "@/web/features/orders/order-detail-page";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  component: OrderDetailPage,
});
