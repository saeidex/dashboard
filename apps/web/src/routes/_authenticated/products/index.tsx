import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import z from "zod";

import { Products } from "@/web/features/products";
import { statuses } from "@/web/features/products/data/data";
import { createProductsQueryOptions } from "@/web/features/products/data/queries";

const categories = getRouteApi("/_authenticated/categories/").useLoaderData();

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

export type ProductSearch = z.infer<typeof productSearchSchema>;

export const Route = createFileRoute("/_authenticated/products/")({
  validateSearch: productSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) => context.queryClient.ensureQueryData(createProductsQueryOptions(search)),
  component: Products,
});
