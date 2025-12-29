import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import type { Currency } from "./expenses"

import { customers, selectCustomersSchema } from "./customers"
import { currencySchema } from "./expenses"
import { products, selectProductWithSizeSchema } from "./products"

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                  Tables                                    */

export const orders = sqliteTable("orders", {
  id           : integer().primaryKey({autoIncrement: true}),
  customerId   : text().references(() => customers.id).notNull(),
  orderStatus  : text().$type<OrderStatus>().default("pending").notNull(),
  paymentStatus: text().$type<PaymentStatus>().default("unpaid").notNull(),
  paymentMethod: text().$type<PaymentMethod>().default("cash").notNull(),
  currency     : text().$type<Currency>().default("BDT").notNull(),
  retailPrice  : real().notNull().default(0).notNull(),
  tax          : real().notNull().default(0).notNull(),
  shipping     : real().notNull().default(0).notNull(),
  grandTotal   : real().notNull().default(0).notNull(),
  notes        : text(),
  createdAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, table => [
  index("idx_orders_customer_id").on(table.customerId),
  index("idx_orders_order_status").on(table.orderStatus),
  index("idx_orders_payment_status").on(table.paymentStatus),
])

export const orderItems = sqliteTable("order_items", {
  id       : text().primaryKey().$defaultFn(() => createId()),
  orderId  : integer().notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text().notNull().references(() => products.id),
  quantity : integer().default(1).notNull(),
  retailPricePerUnit: real().default(0.0).notNull(),
  taxPerUnit        : real().default(0.0).notNull(),
  totalRetailPrice  : real().default(0.0).notNull(),
  totalTax          : real().default(0.0).notNull(),
  grandTotal        : real().default(0.0).notNull(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, table => [
  index("idx_order_items_order_id").on(table.orderId),
  index("idx_order_items_product_id").on(table.productId),
])

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                Relations                                   */

export const ordersRelations = relations(orders, ({ one, many }) => ({
  items   : many(orderItems),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order  : one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}))

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                  Schemas                                   */

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

const selectOrdersSchema = createSelectSchema(orders, {
  orderStatus  : orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  paymentMethod: paymentMethodSchema,
  currency     : currencySchema,
  createdAt    : z.string(),
  updatedAt    : z.string(),
})
const selectOrderItemsSchema = createSelectSchema(orderItems, {
  createdAt: z.string(),
  updatedAt: z.string(),
})

const insertOrdersSchema = createInsertSchema(orders, {
  orderStatus  : orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  currency     : currencySchema.optional(),
  customerId   : schema => schema.min(1, "Customer ID is required"),
  retailPrice  : schema => schema.min(0, "Base price must be a positive number"),
  tax          : schema => schema.min(0, "Tax must be a positive number"),
  shipping     : schema => schema.min(0, "Shipping cost must be a positive number"),
  grandTotal   : schema => schema.min(0, "Grand total must be a positive number"),
  notes        : schema => schema.max(500, "Notes must be at most 500 characters long"),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
})
const insertOrderItemsSchema = createInsertSchema(orderItems, {
  id       : schema => schema.min(1, "Order Item ID is required"),
  productId: schema => schema.min(1, "Product ID is required"),
  quantity : schema => schema.min(1, "Quantity must be at least 1"),
  retailPricePerUnit: schema => schema.min(0, "Retail price per unit must be a positive number"),
  taxPerUnit        : schema => schema.min(0, "Tax per unit must be a positive number"),
  totalRetailPrice  : schema => schema.min(0, "Total retail price must be a positive number"),
  totalTax          : schema => schema.min(0, "Total tax must be a positive number"),
  grandTotal        : schema => schema.min(0, "Grand total must be a positive number"),
}).omit({
  orderId  : true,
  createdAt: true,
  updatedAt: true,
})

const patchOrdersSchema = insertOrdersSchema.omit({ customerId: true }).partial()
const patchOrderItemsSchema = insertOrderItemsSchema.partial().extend({
  id: z.string().min(1, "Order Item ID is required"),
})

// Schemas with relations

/**
 * Order with items
 * @example data: { ...orderData, items: OrderItem[] } // without product/customer details
 */
export const selectOrderWithItemsSchema = selectOrdersSchema.extend({
  items: z.array(selectOrderItemsSchema),
})
export type selectOrderWithItemsSchema = z.infer<typeof selectOrderWithItemsSchema>

/**
 * Order with items with product and customer info
 * @example data: { ...orderData, items: OrderItem[{...item, product}], customer: Customer }
 */
export const selectOrderDetailsSchema = selectOrdersSchema.extend({
  items: z.array(selectOrderItemsSchema.extend({
    product: selectProductWithSizeSchema,
  })),
  customer: selectCustomersSchema,
})
export type selectOrderDetailsSchema = z.infer<typeof selectOrderDetailsSchema>

/**
 * Order list Query params
 * @example: { pageIndex: 0, pageSize: 10 }
 */
export const orderListQueryParamsSchema = z.object({
  customerId: z.string().min(1).optional(),
  pageIndex : z.coerce.number().min(0).default(0).optional(),
  pageSize  : z.coerce.number().min(1).default(10).optional(),
})
export type orderListQueryParamsSchema = z.infer<typeof orderListQueryParamsSchema>

/**
 *  Paginated Order details with items with product and customer info
 *  @example query params to fetch:
 *  pageIndex,
 *  pageSize,
 *
 *  @example data: { rows: OrderDetails[], pageCount: number, rowCount: number }
 */
export const selectPaginatedOrderDetailsSchema = z.object({
  rows     : z.array(selectOrderDetailsSchema),
  pageCount: z.number(),
  rowCount : z.number(),
})
export type selectPaginatedOrderDetailsSchema = z.infer<typeof selectPaginatedOrderDetailsSchema>

/**
 *  Insert Order with items
 *  @example payload:
 * {
 *   ...orderData,
 *   items: [
 *     {
 *       id?: "item-id", // <- auto-generated if not provided
 *       productId: "product-id",
 *       quantity: 2,
 *       total: 100,
 *     },
 *   ],
 * }
 */
export const insertOrderWithItemsSchema = insertOrdersSchema.extend({
  items: z.array(insertOrderItemsSchema).min(1, "At least one item is required"),
})
export type insertOrderWithItemsSchema = z.infer<typeof insertOrderWithItemsSchema>

/**
 * Patch Order with items
 * @example payload:
 * {
 *   ...orderData,
 *   items: [
 *     {
 *       id: "item-id", // <- required to identify existing items
 *       productId: "product-id",
 *       quantity: 2,
 *       total: 100,
 *     },
 *   ],
 * }
 */
export const patchOrderWithItemsSchema = patchOrdersSchema.extend({
  items: z.array(patchOrderItemsSchema).min(1, "At least one item is required"),
})
export type patchOrderWithItemsSchema = z.infer<typeof patchOrderWithItemsSchema>
