import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import type { Currency } from "./expenses"
import type { PaymentMethod } from "./orders"

import { customers } from "./customers"
import { currencySchema } from "./expenses"
import { orders, paymentMethodSchema } from "./orders"

/* -------------------------------------------------------------------------- */
/*                                  Tables                                    */
/* -------------------------------------------------------------------------- */

export const payments = sqliteTable("payments", {
  id           : text().primaryKey().$defaultFn(createId).notNull(),
  orderId      : integer().references(() => orders.id, { onDelete: "cascade" }).notNull(),
  customerId   : text().references(() => customers.id).notNull(),
  amount       : real().notNull(),
  paymentMethod: text().$type<PaymentMethod>().default("cash").notNull(),
  currency     : text().$type<Currency>().default("BDT").notNull(),
  reference    : text(), // Transaction ID, check number, etc.
  notes        : text(),
  paidAt       : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  deletedAt    : integer({ mode: "timestamp" }), // Soft delete timestamp
  createdAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt    : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, table => [
  index("idx_payments_order_id").on(table.orderId),
  index("idx_payments_customer_id").on(table.customerId),
  index("idx_payments_paid_at").on(table.paidAt),
])

/* -------------------------------------------------------------------------- */
/*                                Relations                                   */
/* -------------------------------------------------------------------------- */

export const paymentsRelations = relations(payments, ({ one }) => ({
  order   : one(orders, { fields: [payments.orderId], references: [orders.id] }),
  customer: one(customers, { fields: [payments.customerId], references: [customers.id] }),
}))

/* -------------------------------------------------------------------------- */
/*                                  Schemas                                   */
/* -------------------------------------------------------------------------- */

export const selectPaymentsSchema = createSelectSchema(payments, {
  paymentMethod: paymentMethodSchema,
  currency     : currencySchema,
  paidAt       : z.string(),
  deletedAt    : z.string().nullable(),
  createdAt    : z.string(),
  updatedAt    : z.string(),
})
export type selectPaymentsSchema = z.infer<typeof selectPaymentsSchema>

export const selectPaymentWithRelationsSchema = selectPaymentsSchema.extend({
  order: z.object({
    id           : z.number(),
    orderStatus  : z.string(),
    paymentStatus: z.string(),
    grandTotal   : z.number(),
    totalPaid    : z.number(),
  }),
  customer: z.object({
    id   : z.string(),
    name : z.string(),
    email: z.string(),
    phone: z.string(),
  }),
})
export type selectPaymentWithRelationsSchema = z.infer<typeof selectPaymentWithRelationsSchema>

export const insertPaymentsSchema = createInsertSchema(payments, {
  orderId      : schema => schema.min(1, "Order ID is required"),
  customerId   : schema => schema.min(1, "Customer ID is required"),
  amount       : schema => schema.min(0, "Amount must be greater than 0"),
  paymentMethod: paymentMethodSchema.optional(),
  currency     : currencySchema.optional(),
  reference    : schema => schema.max(100, "Reference must be less than 100 characters").optional(),
  notes        : schema => schema.max(500, "Notes must be less than 500 characters").optional(),
  paidAt       : z.coerce.date().optional(),
}).omit({
  id       : true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})
export type insertPaymentsSchema = z.infer<typeof insertPaymentsSchema>

export const patchPaymentsSchema = insertPaymentsSchema.omit({ orderId: true, customerId: true }).partial()
export type patchPaymentsSchema = z.infer<typeof patchPaymentsSchema>

/**
 * Payment list Query params
 * @example: { pageIndex: 0, pageSize: 10, orderId: 1 }
 */
export const paymentListQueryParamsSchema = z.object({
  orderId   : z.coerce.number().min(1).optional(),
  customerId: z.string().min(1).optional(),
  pageIndex : z.coerce.number().min(0).default(0).optional(),
  pageSize  : z.coerce.number().min(1).default(10).optional(),
})
export type paymentListQueryParamsSchema = z.infer<typeof paymentListQueryParamsSchema>

/**
 * Paginated payments response
 * @example data: { rows: Payment[], pageCount: number, rowCount: number }
 */
export const selectPaginatedPaymentsSchema = z.object({
  rows     : z.array(selectPaymentWithRelationsSchema),
  pageCount: z.number(),
  rowCount : z.number(),
})
export type selectPaginatedPaymentsSchema = z.infer<typeof selectPaginatedPaymentsSchema>

/**
 * Payment summary for an order
 */
export const orderPaymentSummarySchema = z.object({
  orderId     : z.number(),
  totalPaid   : z.number(),
  grandTotal  : z.number(),
  balance     : z.number(),
  paymentCount: z.number(),
})
export type orderPaymentSummarySchema = z.infer<typeof orderPaymentSummarySchema>
