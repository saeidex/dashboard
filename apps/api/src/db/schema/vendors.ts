import type z from "zod"

import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const vendors = sqliteTable("vendors", {
  id: text().primaryKey().$defaultFn(createId),
  vendorId: text().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  address: text(),
  city: text(),
  notes: text(),
  isActive: integer({ mode: "boolean" }).notNull().default(true),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_vendors_vendor_id").on(table.vendorId),
])

export const selectVendorsSchema = createSelectSchema(vendors)
export type selectVendorsSchema = z.infer<typeof selectVendorsSchema>

export const insertVendorsSchema = createInsertSchema(vendors, {
  vendorId: schema => schema.min(1, "Vendor ID is required"),
  name: schema => schema.min(1, "Name is required"),
  email: schema => schema.email("Invalid email address"),
  phone: schema => schema.min(1, "Phone is required"),
  address: schema => schema.max(255, "Address must be less than 255 characters").optional(),
  city: schema => schema.max(100, "City must be less than 100 characters").optional(),
  notes: schema => schema.max(500, "Notes must be less than 500 characters").optional(),
  isActive: schema => schema.default(true).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type insertVendorsSchema = z.infer<typeof insertVendorsSchema>

export const patchVendorsSchema = insertVendorsSchema.partial()
export type patchVendorsSchema = z.infer<typeof patchVendorsSchema>
