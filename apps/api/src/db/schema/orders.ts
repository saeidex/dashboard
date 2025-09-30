import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import { customers, selectCustomersSchema } from "./customers"
import { products } from "./products"

export const orderStatusSchema = z.union([
  z.literal("pending"),
  z.literal("processing"),
  z.literal("shipped"),
  z.literal("delivered"),
  z.literal("cancelled"),
  z.literal("returned"),
]).default("pending")
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const paymentStatusSchema = z.union([
  z.literal("unpaid"),
  z.literal("partial"),
  z.literal("paid"),
  z.literal("refunded"),
]).default("unpaid")
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

export const paymentMethodSchema = z.union([
  z.literal("cash"),
  z.literal("card"),
  z.literal("bank-transfer"),
  z.literal("mobile-wallet"),
]).default("cash")
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export const currencySchema = z.union([
  z.literal("BDT"),
]).default("BDT")
export type Currency = z.infer<typeof currencySchema>

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                 Orders Table                               */

export const orders = sqliteTable("orders", {
  id           : text().primaryKey().$defaultFn(createId),
  customerId   : text().references(() => customers.id).notNull(),
  status       : text().$type<OrderStatus>().default("pending").notNull(),
  paymentStatus: text().$type<PaymentStatus>().default("unpaid").notNull(),
  paymentMethod: text().$type<PaymentMethod>().default("cash").notNull(),
  currency     : text().$type<Currency>().default("BDT").notNull(),
  itemsTotal   : real().notNull().default(0).notNull(),
  itemsTaxTotal: real().notNull().default(0).notNull(),
  discountTotal: real().notNull().default(0).notNull(),
  shipping     : real().notNull().default(0).notNull(),
  grandTotal   : real().notNull().default(0).notNull(),
  notes        : text(),
  createdAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, table => [
  index("idx_orders_customer_id").on(table.customerId),
  index("idx_orders_status").on(table.status),
  index("idx_orders_payment_status").on(table.paymentStatus),
])

export const selectOrdersSchema = createSelectSchema(orders, {
  status       : orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  paymentMethod: paymentMethodSchema,
  currency     : currencySchema,
})
export type selectOrdersSchema = z.infer<typeof selectOrdersSchema>

const insertOrdersSchema = createInsertSchema(orders, {
  status       : orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  currency     : currencySchema.optional(),
  customerId   : schema => schema.min(1, "Customer is required"),
  itemsTotal   : schema => schema.min(0, "Items total must be a non-negative number"),
  itemsTaxTotal: schema => schema.min(0, "Items tax total must be a non-negative number"),
  discountTotal: schema => schema.min(0, "Discount total must be a non-negative number"),
  shipping     : schema => schema.min(0, "Shipping cost must be a non-negative number"),
  grandTotal   : schema => schema.min(0, "Grand total must be a non-negative number"),
  notes        : schema => schema.max(500, "Notes must be at most 500 characters long"),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})

const patchOrdersSchema = insertOrdersSchema.omit({ customerId: true }).partial()

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                            Order Items Table                               */

export const orderItems = sqliteTable("order_items", {
  id                : text().primaryKey().$defaultFn(createId),
  orderId           : text().notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId         : text().notNull().references(() => products.id),
  productTitle      : text().notNull(),
  currency          : text().$type<Currency>().default("BDT").notNull(),
  unitPrice         : real().notNull(),
  quantity          : integer().notNull().default(1),
  discountPercentage: real().notNull().default(0),
  discountAmount    : real().notNull().default(0),
  taxPercentage     : real().notNull().default(0),
  taxAmount         : real().notNull().default(0),
  total             : real().notNull(),
  subTotal          : real().notNull(),
  createdAt         : integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt         : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_order_items_order_id").on(table.orderId),
  index("idx_order_items_product_id").on(table.productId),
])

const selectOrderItemsSchema = createSelectSchema(orderItems, {
  currency: currencySchema,
})

export const insertOrderItemsSchema = createInsertSchema(orderItems, {
  currency          : currencySchema.optional(),
  productId         : schema => schema.min(1, "Product ID is required"),
  productTitle      : schema => schema.min(1, "Product title is required").max(200, "Product title must be at most 200 characters long"),
  unitPrice         : schema => schema.min(0, "Unit price must be a non-negative number"),
  quantity          : schema => schema.min(1, "Quantity must be at least 1").max(10000, "Quantity cannot exceed 10,000 units"),
  discountPercentage: schema => schema.min(0, "Discount percentage must be non-negative").max(100, "Discount percentage cannot exceed 100%"),
  discountAmount    : schema => schema.min(0, "Discount amount must be a non-negative number"),
  taxPercentage     : schema => schema.min(0, "Tax percentage must be non-negative").max(100, "Tax percentage cannot exceed 100%"),
  taxAmount         : schema => schema.min(0, "Tax amount must be a non-negative number"),
  subTotal          : schema => schema.min(0, "Sub total must be a non-negative number"),
  total             : schema => schema.min(0, "Total must be a non-negative number"),
}).omit({
  id       : true,
  orderId  : true,
  createdAt: true,
  updatedAt: true,
})
export type insertOrderItemsSchema = z.infer<typeof insertOrderItemsSchema>

export const patchOrderItemsSchema = insertOrderItemsSchema.partial().extend({
  id: z.string().min(1, "Item ID is required"),
})
export type patchOrderItemsSchema = z.infer<typeof patchOrderItemsSchema>

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                             Combined Schemas                               */

export const selectOrderWithItemsAndCustomerSchema = selectOrdersSchema.extend({
  items   : z.array(selectOrderItemsSchema).min(1, "Items are required!"),
  customer: selectCustomersSchema,
})

export const selectOrderWithItemsSchema = selectOrdersSchema.extend({
  items: z.array(selectOrderItemsSchema),
})

export const insertOrderWithItemsSchema = insertOrdersSchema.extend({
  items: z.array(insertOrderItemsSchema),
})

export const patchOrderWithItemsSchema = patchOrdersSchema.extend({
  items: z.array(patchOrderItemsSchema).optional(),
})

export type selectOrderWithItemsAndCustomerSchema = z.infer<typeof selectOrderWithItemsAndCustomerSchema>
export type selectOrderWithItemsSchema = z.infer<typeof selectOrderWithItemsSchema>
export type insertOrderWithItemsSchema = z.infer<typeof insertOrderWithItemsSchema>
export type patchOrderWithItemsSchema = z.infer<typeof patchOrderWithItemsSchema>

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                Relations                                   */

export const ordersRelation = relations(orders, ({ one, many }) => ({
  items   : many(orderItems),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
}))

export const orderItemsRelation = relations(orderItems, ({ one }) => ({
  order  : one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}))
