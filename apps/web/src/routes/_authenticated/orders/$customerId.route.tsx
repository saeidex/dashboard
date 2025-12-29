/* eslint-disable unicorn/filename-case */
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/orders/$customerId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
