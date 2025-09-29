import type z from "zod"

import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

// TODO: remove customerId field
export const customers = sqliteTable("customers", {
  id        : text().primaryKey().$defaultFn(createId),
  customerId: text().notNull(),
  name      : text().notNull(),
  email     : text().notNull(),
  phone     : text().notNull(),
  address   : text(),
  city      : text(),
  notes     : text(),
  isActive  : integer({ mode: "boolean" }).notNull().default(true),
  createdAt : integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_customers_customer_id").on(table.customerId),
])

export const selectCustomersSchema = createSelectSchema(customers)
export type selectCustomersSchema = z.infer<typeof selectCustomersSchema>

export const insertCustomersSchema = createInsertSchema(customers, {
  customerId: schema => schema.min(1, "Customer ID is required"),
  name      : schema => schema.min(1, "Name is required"),
  email     : schema => schema.email("Invalid email address"),
  phone     : schema => schema.min(1, "Phone is required"),
  address   : schema => schema.max(255, "Address must be less than 255 characters").optional(),
  city      : schema => schema.max(100, "City must be less than 100 characters").optional(),
  notes     : schema => schema.max(500, "Notes must be less than 500 characters").optional(),
  isActive  : schema => schema.default(true).optional(),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
export type insertCustomersSchema = z.infer<typeof insertCustomersSchema>

export const patchCustomersSchema = insertCustomersSchema.partial()
export type patchCustomersSchema = z.infer<typeof patchCustomersSchema>
