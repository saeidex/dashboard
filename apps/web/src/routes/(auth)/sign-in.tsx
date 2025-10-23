import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { SignIn } from "@/web/features/auth/sign-in";
import apiClient from "@/web/lib/api-client";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/sign-in")({
  component: SignIn,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const response = await apiClient.api.onboarding.status.$get();

    if (response.ok) {
      const data = await response.json();
      if (data.needsOnboarding) {
        throw redirect({
          to: "/onboarding",
        });
      }
    }
  },
});
