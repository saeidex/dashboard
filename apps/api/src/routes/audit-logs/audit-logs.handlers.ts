import { count, desc, eq } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { auditLogs } from "@/api/db/schema"

import type { ListRoute, RecentRoute } from "./audit-logs.routes"

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { limit = 20, offset = 0, orderId, entityType } = c.req.valid("query")

  // Build where conditions
  const whereConditions = []
  if (orderId) {
    whereConditions.push(eq(auditLogs.orderId, orderId))
  }
  if (entityType) {
    whereConditions.push(eq(auditLogs.entityType, entityType))
  }

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(auditLogs)

  // Get paginated data with relations
  const data = await db.query.auditLogs.findMany({
    with: {
      order: {
        columns: { id: true, grandTotal: true },
      },
      customer: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [desc(auditLogs.createdAt)],
    limit,
    offset,
  })

  return c.json({
    data,
    rowCount: total,
    limit,
    offset,
  }, HttpStatusCodes.OK)
}

export const recent: AppRouteHandler<RecentRoute> = async (c) => {
  const { limit = 5 } = c.req.valid("query")

  const data = await db.query.auditLogs.findMany({
    with: {
      order: {
        columns: { id: true, grandTotal: true },
      },
      customer: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [desc(auditLogs.createdAt)],
    limit,
  })

  return c.json(data, HttpStatusCodes.OK)
}
