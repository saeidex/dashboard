import { createFileRoute } from "@tanstack/react-router";

import { Settings } from "@/web/features/settings";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});
