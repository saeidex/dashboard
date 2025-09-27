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

export const insertVendorsSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type insertVendorsSchema = z.infer<typeof insertVendorsSchema>

export const patchVendorsSchema = insertVendorsSchema.partial()
export type patchVendorsSchema = z.infer<typeof patchVendorsSchema>
