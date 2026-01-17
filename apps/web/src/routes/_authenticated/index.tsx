import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/web/features/dashboard";

export const Route = createFileRoute("/_authenticated/")({
  //   beforeLoad() {
  //     throw redirect({ to: "/products" });
  //   },
  component: Dashboard,
});
