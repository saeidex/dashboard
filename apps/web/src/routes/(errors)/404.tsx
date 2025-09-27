import { createFileRoute } from "@tanstack/react-router";

import { NotFoundError } from "@/web/features/errors/not-found-error";

export const Route = createFileRoute("/(errors)/404")({
  component: NotFoundError,
});
