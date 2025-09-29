import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import { productCategories } from "./product-categories"

export const products = sqliteTable("products", {
  id                : text().primaryKey().$defaultFn(createId),
  title             : text().notNull(),
  status            : text().notNull(),
  label             : text(),
  categoryId        : text().references(() => productCategories.id),
  basePrice         : real().notNull().default(0),
  discountPercentage: real().notNull().default(0),
  discountAmount    : real().notNull().default(0),
  taxPercentage     : real().notNull().default(0),
  taxAmount         : real().notNull().default(0),
  total             : real().notNull().default(0),
  currency          : text().notNull().default("BDT"),
  stock             : integer({ mode: "number" }).notNull().default(0),
  createdAt         : integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt         : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_products_category_id").on(table.categoryId),
  index("idx_products_status").on(table.status),
])

export const selectProductsSchema = createSelectSchema(products, {
  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),
})
export type selectProductsSchema = z.infer<typeof selectProductsSchema>

export const insertProductsSchema = createInsertSchema(products, {
  title             : schema => schema.min(3, "Title must be at least 3 characters long").max(255, "Title must be at most 255 characters long"),
  status            : schema => schema.min(3, "Status must be at least 3 characters long").max(50, "Status must be at most 50 characters long"),
  label             : schema => schema.max(100, "Label must be at most 100 characters long").optional(),
  currency          : schema => schema.min(3, "Currency must be at least 3 characters long").max(10, "Currency must be at most 10 characters long"),
  stock             : schema => schema.min(0).optional(),
  basePrice         : schema => schema.min(0),
  discountPercentage: schema => schema.min(0).max(100).optional(),
  discountAmount    : schema => schema.min(0).optional(),
  taxPercentage     : schema => schema.min(0).max(100).optional(),
  taxAmount         : schema => schema.min(0).optional(),
  total             : schema => schema.min(0),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
export type insertProductsSchema = z.infer<typeof insertProductsSchema>

export const patchProductsSchema = insertProductsSchema.partial()
export type patchProductsSchema = z.infer<typeof patchProductsSchema>
