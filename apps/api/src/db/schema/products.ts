import type z from "zod"

import { createId } from "@paralleldrive/cuid2"
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import { productCategories } from "./product-categories"

export const products = sqliteTable("products", {
  id: text().primaryKey().$defaultFn(createId),
  productId: text().notNull(),
  title: text().notNull(),
  status: text().notNull(),
  label: text(),
  categoryId: text().references(() => productCategories.id),
  basePrice: real().notNull().default(0),
  discountPercentage: real().notNull().default(0),
  discountAmount: real().notNull().default(0),
  taxPercentage: real().notNull().default(0),
  taxAmount: real().notNull().default(0),
  total: real().notNull().default(0),
  currency: text().notNull().default("BDT"),
  sku: text().notNull(),
  stock: integer({ mode: "number" }).notNull().default(0),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_products_product_id").on(table.productId),
  uniqueIndex("uq_products_sku").on(table.sku),
  index("idx_products_category_id").on(table.categoryId),
  index("idx_products_status").on(table.status),
])

export const selectProductsSchema = createSelectSchema(products)
export type selectProductsSchema = z.infer<typeof selectProductsSchema>

export const insertProductsSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type insertProductsSchema = z.infer<typeof insertProductsSchema>

export const patchProductsSchema = insertProductsSchema.partial()
export type patchProductsSchema = z.infer<typeof patchProductsSchema>
