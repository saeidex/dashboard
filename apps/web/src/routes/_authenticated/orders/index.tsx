import { createFileRoute } from "@tanstack/react-router";

import { Orders } from "@/web/features/orders";

export const Route = createFileRoute("/_authenticated/orders/")({
  component: Orders,
});
