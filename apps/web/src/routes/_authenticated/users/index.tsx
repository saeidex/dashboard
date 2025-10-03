import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Users } from "@/web/features/users";

const usersSearchSchema = z.object({
  pageIndex: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  role: z
    .array(z.union([z.literal("admin"), z.literal("user")]))
    .optional()
    .catch([]),
});

export type UsersSearch = z.infer<typeof usersSearchSchema>;

export const Route = createFileRoute("/_authenticated/users/")({
  validateSearch: usersSearchSchema,
  component: Users,
});
