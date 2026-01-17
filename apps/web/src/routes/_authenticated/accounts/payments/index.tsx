import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Payments } from "@/web/features/accounts/payments";

const searchSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(10),
  customer: z.string().optional(),
  method: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/accounts/payments/")({
  validateSearch: searchSchema,
  component: Payments,
});
