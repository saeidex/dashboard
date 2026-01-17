import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthenticatedLayout } from "@/web/components/layout/authenticated-layout";
import { authClient } from "@/web/features/auth/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();

    const isValidAdmin
      = session && session.user?.role?.includes("admin") && !session.user?.banned;

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
