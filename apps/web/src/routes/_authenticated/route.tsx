import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthenticatedLayout } from "@/web/components/layout/authenticated-layout";
import { useAuthStore } from "@/web/stores/auth-store";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { user } = useAuthStore.getState().auth;

    const isValidAdmin = user
      && user.role?.includes("admin")
      && !user.banned;

    if (!isValidAdmin) {
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});
