import { z } from "zod";

const userRoleSchema = z.union([
  z.literal("superadmin"),
  z.literal("admin"),
  z.literal("manager"),
]);

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  userId: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);
