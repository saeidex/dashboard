import type { AuditActionType } from "@/api/db/schema"

import db from "@/api/db"
import { auditLogs } from "@/api/db/schema"

interface CreateAuditLogParams {
  actionType: AuditActionType
  entityType: string
  entityId: string
  description: string
  orderId?: number | null
  customerId?: string | null
  metadata?: Record<string, unknown>
  performedBy?: string
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  const {
    actionType,
    entityType,
    entityId,
    description,
    orderId,
    customerId,
    metadata,
    performedBy,
  } = params

  await db.insert(auditLogs).values({
    actionType,
    entityType,
    entityId,
    description,
    orderId: orderId ?? null,
    customerId: customerId ?? null,
    metadata: metadata ? JSON.stringify(metadata) : null,
    performedBy: performedBy ?? null,
  })
}

/**
 * Format currency for audit descriptions
 */
export function formatCurrency(amount: number, currency = "BDT"): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
