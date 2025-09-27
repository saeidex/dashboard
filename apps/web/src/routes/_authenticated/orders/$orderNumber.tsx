import { createFileRoute, notFound } from "@tanstack/react-router";

import { orders } from "@/web/features/orders/data/orders";
import { OrderDetailPage } from "@/web/features/orders/order-detail-page";

export const Route = createFileRoute("/_authenticated/orders/$orderNumber")({
  parseParams: p => ({ orderNumber: p.orderNumber }),
  loader: ({ params }) => {
    const order = orders.find(o => o.orderNumber === params.orderNumber);
    if (!order) {
      throw notFound();
    }
    return { order };
  },
  component: () => () => {
    const { order } = Route.useLoaderData();
    return <OrderDetailPage order={order} />;
  },
});
