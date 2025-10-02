import { createFileRoute } from "@tanstack/react-router";

import { createOrderQueryOptions } from "@/web/features/orders/data/queries";
import { OrderDetailPage } from "@/web/features/orders/order-detail-page";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  parseParams: p => ({ id: p.id }),
  loader: ({ context, params: { id } }) => context.queryClient.ensureQueryData(createOrderQueryOptions(id)),
  component: OrderDetailPage,
});
