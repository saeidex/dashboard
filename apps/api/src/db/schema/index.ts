import type { NoUndefined } from "node_modules/zod/v4/core/util.cjs"

import { z } from "@hono/zod-openapi"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import type { auth } from "@/api/lib/auth"

import { users } from "./auth"

export type userRoleSchema = NoUndefined<Parameters<typeof auth.api.createUser>[0]["body"]["role"]>
export const userRoleSchema = z.union([z.literal("user"), z.literal("admin"), z.array(z.literal("admin").or(z.literal("user")))])

export const selectUsersSchema = createSelectSchema(users, {
  banned    : z.boolean().nullable().optional(),
  banReason : z.string().nullable().optional(),
  banExpires: z.date().nullable().optional(),
  role      : z.string().optional().or(z.string().nullable()),
  image     : z.string().nullable().optional(),
  createdAt : z.date(),
  updatedAt : z.date(),
})
export type selectUsersSchema = z.infer<typeof selectUsersSchema>

export const insertUsersSchema = createInsertSchema(users, {
  image: z.string().optional().nullable().refine((val) => {
    if (val === null || val === undefined || val === "")
      return true
    return z.url().safeParse(val).success
  }, { message: "Image must be a valid URL" }),
  name : schema => schema.min(1, "Name is required"),
  email: schema => schema.min(1, "Email is required").email("Invalid email"),
  role : userRoleSchema.optional().default("user"),
}).extend({ password: z.string().min(8, "Password must be at least 8 characters").refine(val => /[A-Z]/.test(val), "Password must contain at least one uppercase letter").refine(val => /[a-z]/.test(val), "Password must contain at least one lowercase letter").refine(val => /\d/.test(val), "Password must contain at least one number") }).omit({ id: true, createdAt: true, updatedAt: true })
export type insertUsersSchema = z.infer<typeof insertUsersSchema>

export const patchUsersSchema = insertUsersSchema.extend({
  role: z.string().optional(),
}).partial().omit({ email: true, password: true })
export type patchUsersSchema = z.infer<typeof patchUsersSchema>

// Export all schemas and tables

export * from "./auth"
export * from "./customers"
export * from "./employees"
export * from "./expenses"
export * from "./orders"
export * from "./product-categories"
export * from "./products"
