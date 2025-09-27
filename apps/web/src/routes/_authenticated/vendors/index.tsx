import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Vendors } from "@/web/features/vendors";

const vendorSearchSchema = z.object({
  page: z.number().optional().catch(1),
  per_page: z.number().optional().catch(10),
  name: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_authenticated/vendors/")({
  validateSearch: vendorSearchSchema,
  component: Vendors,
});
