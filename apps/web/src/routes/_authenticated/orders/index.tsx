import { orderListQueryParamsSchema } from "@crm/api/schema";
import { createFileRoute } from "@tanstack/react-router";

import { Orders } from "@/web/features/orders";
import { createOrdersQueryOptions } from "@/web/features/orders/data/queries";

export const Route = createFileRoute("/_authenticated/orders/")({
  validateSearch: orderListQueryParamsSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) => context.queryClient.ensureQueryData(createOrdersQueryOptions(search)),
  component: Orders,
});
