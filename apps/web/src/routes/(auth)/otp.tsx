import { createFileRoute } from "@tanstack/react-router";

import { Otp } from "@/web/features/auth/otp";

export const Route = createFileRoute("/(auth)/otp")({
  component: Otp,
});
