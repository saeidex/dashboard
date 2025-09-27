import type z from "zod"

import { createId } from "@paralleldrive/cuid2"
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import { products } from "./products"

export const orders = sqliteTable("orders", {
  id: text().primaryKey().$defaultFn(createId),
  orderNumber: integer({ mode: "number" }).notNull(),
  customerId: text().notNull(),
  status: text().notNull().default("pending"),
  paymentStatus: text().notNull().default("unpaid"),
  paymentMethod: text(),
  itemsTotal: real().notNull().default(0),
  itemsTaxTotal: real().notNull().default(0),
  discountTotal: real().notNull().default(0),
  shipping: real().notNull().default(0),
  grandTotal: real().notNull().default(0),
  currency: text().notNull().default("BDT"),
  notes: text(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_orders_customer_id").on(table.customerId),
  index("idx_orders_status").on(table.status),
  index("idx_orders_payment_status").on(table.paymentStatus),
])

export const selectOrdersSchema = createSelectSchema(orders)
export type selectOrdersSchema = z.infer<typeof selectOrdersSchema>

export const insertOrdersSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type insertOrdersSchema = z.infer<typeof insertOrdersSchema>

export const patchOrdersSchema = insertOrdersSchema.partial()
export type patchOrdersSchema = z.infer<typeof patchOrdersSchema>

/* -------------------------------------------------------------------------- */
/*                                Order Items                                 */
/* -------------------------------------------------------------------------- */

export const orderItems = sqliteTable("order_items", {
  id: text().primaryKey().$defaultFn(createId),
  orderId: text().notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text().notNull().references(() => products.id),
  productTitle: text().notNull(),
  sku: text().notNull(),
  unitPrice: real().notNull().default(0),
  quantity: integer({ mode: "number" }).notNull().default(1),
  discountPercentage: real().notNull().default(0),
  discountAmount: real().notNull().default(0),
  taxPercentage: real().notNull().default(0),
  taxAmount: real().notNull().default(0),
  subTotal: real().notNull().default(0),
  total: real().notNull().default(0),
  currency: text().notNull().default("BDT"),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_order_items_order_id").on(table.orderId),
  index("idx_order_items_product_id").on(table.productId),
  index("idx_order_items_sku").on(table.sku),
])

export const selectOrderItemsSchema = createSelectSchema(orderItems)
export type selectOrderItemsSchema = z.infer<typeof selectOrderItemsSchema>

export const insertOrderItemsSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type insertOrderItemsSchema = z.infer<typeof insertOrderItemsSchema>

export const patchOrderItemsSchema = (createInsertSchema(orderItems).omit({
  id: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
}).partial())
export type patchOrderItemsSchema = z.infer<typeof patchOrderItemsSchema>
