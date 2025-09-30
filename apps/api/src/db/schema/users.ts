import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const userRoleSchema = z.union([
  z.literal("superadmin"),
  z.literal("admin"),
  z.literal("manager"),
]).default("manager")
export type UserRole = z.infer<typeof userRoleSchema>

const UserStatusSchema = z.enum(["active", "inactive"]).default("active")
export type UserStatus = z.infer<typeof UserStatusSchema>

export const users = sqliteTable("users", {
  id         : text().primaryKey().$defaultFn(createId),
  firstName  : text().notNull(),
  lastName   : text().notNull(),
  userId     : text().notNull(),
  email      : text().notNull(),
  phoneNumber: text().notNull(),
  status     : text().$type<UserStatus>().default("active").notNull(),
  role       : text().$type<UserRole>().default("manager").notNull(),
  createdAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull().$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_users_user_id").on(table.userId),
  index("idx_users_email").on(table.email),
])

export const selectUsersSchema = createSelectSchema(users, {
  role     : userRoleSchema,
  status   : UserStatusSchema,
  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),
})
export type selectUsersSchema = z.infer<typeof selectUsersSchema>

export const insertUsersSchema = createInsertSchema(users, {
  role       : userRoleSchema.optional(),
  status     : UserStatusSchema.optional(),
  firstName  : schema => schema.min(1, "First name is required").max(100, "First name must be at most 100 characters long"),
  lastName   : schema => schema.min(1, "Last name is required").max(100, "Last name must be at most 100 characters long"),
  userId     : schema => schema.min(1, "User ID is required").max(50, "User ID must be at most 50 characters long"),
  email      : schema => schema.email("Invalid email address").max(100, "Email must be at most 100 characters long"),
  phoneNumber: schema => schema.min(1, "Phone number is required").max(20, "Phone number must be at most 20 characters long").refine(value => /^\+?[0-9\s\-()]+$/.test(value), "Invalid phone number format"),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
export type insertUsersSchema = z.infer<typeof insertUsersSchema>

export const patchUsersSchema = insertUsersSchema.partial()
export type patchUsersSchema = z.infer<typeof patchUsersSchema>
