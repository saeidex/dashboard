import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Factories } from "@/web/features/factories";

const factorySearchSchema = z.object({
  page: z.number().optional().catch(1),
  per_page: z.number().optional().catch(10),
  name: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_authenticated/factories/")({
  validateSearch: factorySearchSchema,
  component: Factories,
});
