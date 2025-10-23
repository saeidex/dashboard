import { createFileRoute } from "@tanstack/react-router";

import { OnboardingPage } from "@/web/features/onboarding/onboarding-page";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});
