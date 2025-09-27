import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Products } from "@/web/features/products";
import { categories, statuses } from "@/web/features/products/data/data";

const productSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map(status => status.value)))
    .optional()
    .catch([]),
  categoryId: z
    .array(z.enum(categories.map(category => category.id.toString())))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/products/")({
  validateSearch: productSearchSchema,
  component: Products,
});
