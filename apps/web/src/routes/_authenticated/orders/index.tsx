import { createFileRoute } from "@tanstack/react-router";

import { Orders } from "@/web/features/orders";
import { ordersQueryOptions } from "@/web/features/orders/data/queries";

export const Route = createFileRoute("/_authenticated/orders/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(ordersQueryOptions),
  component: Orders,
});
