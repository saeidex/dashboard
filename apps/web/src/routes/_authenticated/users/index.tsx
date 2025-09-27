import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Users } from "@/web/features/users";
import { roles } from "@/web/features/users/data/data";

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  role: z
    .array(z.enum(roles.map(r => r.value as (typeof roles)[number]["value"])))
    .optional()
    .catch([]),
});

export const Route = createFileRoute("/_authenticated/users/")({
  validateSearch: usersSearchSchema,
  component: Users,
});
