import { createFileRoute } from "@tanstack/react-router";

import { SettingsAppearance } from "@/web/features/settings/appearance";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsAppearance,
});
