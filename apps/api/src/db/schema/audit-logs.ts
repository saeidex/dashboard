import { z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import { customers } from "./customers"
import { orders } from "./orders"

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

export const auditActionTypes = [
  "order_created",
  "order_updated",
  "order_deleted",
  "order_status_changed",
  "payment_received",
  "payment_updated",
  "payment_deleted",
  "customer_created",
  "customer_updated",
  "product_created",
  "product_updated",
] as const

export type AuditActionType = typeof auditActionTypes[number]

export const auditActionTypeSchema = z.enum(auditActionTypes)

/* -------------------------------------------------------------------------- */
/*                                  Tables                                    */
/* -------------------------------------------------------------------------- */

export const auditLogs = sqliteTable("audit_logs", {
  id         : text().primaryKey().$defaultFn(createId).notNull(),
  actionType : text().$type<AuditActionType>().notNull(),
  entityType : text().notNull(), // "order", "payment", "customer", etc.
  entityId   : text().notNull(), // The ID of the affected entity
  orderId    : integer().references(() => orders.id, { onDelete: "set null" }),
  customerId : text().references(() => customers.id, { onDelete: "set null" }),
  description: text().notNull(),
  metadata   : text(), // JSON string for additional data
  performedBy: text(), // User ID who performed the action (optional)
  createdAt  : integer({ mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
}, table => [
  index("idx_audit_logs_action_type").on(table.actionType),
  index("idx_audit_logs_entity_type").on(table.entityType),
  index("idx_audit_logs_order_id").on(table.orderId),
  index("idx_audit_logs_customer_id").on(table.customerId),
  index("idx_audit_logs_created_at").on(table.createdAt),
])

/* -------------------------------------------------------------------------- */
/*                                Relations                                   */
/* -------------------------------------------------------------------------- */

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  order   : one(orders, { fields: [auditLogs.orderId], references: [orders.id] }),
  customer: one(customers, { fields: [auditLogs.customerId], references: [customers.id] }),
}))

/* -------------------------------------------------------------------------- */
/*                                  Schemas                                   */
/* -------------------------------------------------------------------------- */

export const selectAuditLogsSchema = createSelectSchema(auditLogs, {
  actionType: auditActionTypeSchema,
  createdAt : z.coerce.date(),
})
export type selectAuditLogsSchema = z.infer<typeof selectAuditLogsSchema>

export const selectAuditLogsWithRelationsSchema = selectAuditLogsSchema.extend({
  order: z.object({
    id        : z.number(),
    grandTotal: z.number(),
  }).nullable().optional(),
  customer: z.object({
    id  : z.string(),
    name: z.string(),
  }).nullable().optional(),
})
export type selectAuditLogsWithRelationsSchema = z.infer<typeof selectAuditLogsWithRelationsSchema>

export const insertAuditLogsSchema = createInsertSchema(auditLogs, {
  actionType : auditActionTypeSchema,
  entityType : schema => schema.min(1, "Entity type is required"),
  entityId   : schema => schema.min(1, "Entity ID is required"),
  description: schema => schema.min(1, "Description is required"),
}).omit({
  id       : true,
  createdAt: true,
})
export type insertAuditLogsSchema = z.infer<typeof insertAuditLogsSchema>
