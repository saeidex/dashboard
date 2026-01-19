import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const factoryStatusSchema = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("suspended"),
]).default("active")
export type FactoryStatus = z.infer<typeof factoryStatusSchema>

export const factories = sqliteTable("factories", {
  id           : text().primaryKey().$defaultFn(createId),
  name         : text().notNull(),
  code         : text().notNull(), // Factory code for quick reference
  address      : text(),
  city         : text(),
  country      : text().default("Bangladesh"),
  contactPerson: text(),
  phone        : text(),
  email        : text(),
  capacity     : integer({ mode: "number" }).default(0), // Total production capacity
  totalLines   : integer({ mode: "number" }).default(0), // Number of production lines
  maxManpower  : integer({ mode: "number" }).default(0), // Maximum workers
  status       : text().$type<FactoryStatus>().default("active").notNull(),
  notes        : text(),
  deletedAt    : integer({ mode: "timestamp" }), // Soft delete timestamp
  createdAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, table => [
  index("idx_factories_status").on(table.status),
  index("idx_factories_code").on(table.code),
])

export const selectFactoriesSchema = createSelectSchema(factories, {
  status   : factoryStatusSchema,
  deletedAt: z.iso.date().nullable(),
  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),
})
export type selectFactoriesSchema = z.infer<typeof selectFactoriesSchema>

export const insertFactoriesSchema = createInsertSchema(factories, {
  name         : schema => schema.min(1, "Name is required").max(255, "Name must be at most 255 characters"),
  code         : schema => schema.min(1, "Code is required").max(50, "Code must be at most 50 characters"),
  address      : schema => schema.max(500, "Address must be at most 500 characters").optional(),
  city         : schema => schema.max(100, "City must be at most 100 characters").optional(),
  country      : schema => schema.max(100, "Country must be at most 100 characters").optional(),
  contactPerson: schema => schema.max(100, "Contact person must be at most 100 characters").optional(),
  phone        : schema => schema.max(20, "Phone must be at most 20 characters").optional(),
  email        : z.email("Invalid email address").max(100, "Email must be at most 100 characters").optional().or(z.literal("")),
  capacity     : schema => schema.min(0, "Capacity must be non-negative").optional(),
  totalLines   : schema => schema.min(0, "Total lines must be non-negative").optional(),
  maxManpower  : schema => schema.min(0, "Max manpower must be non-negative").optional(),
  status       : factoryStatusSchema.optional(),
  notes        : schema => schema.max(500, "Notes must be at most 500 characters").optional(),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})
export type insertFactoriesSchema = z.infer<typeof insertFactoriesSchema>

export const patchFactoriesSchema = insertFactoriesSchema.partial()
export type patchFactoriesSchema = z.infer<typeof patchFactoriesSchema>
