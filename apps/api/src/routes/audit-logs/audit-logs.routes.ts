import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"

import {
  selectAuditLogsWithRelationsSchema,
} from "@/api/db/schema"

const tags = ["Audit Logs"]

const auditLogQueryParamsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
  orderId: z.coerce.number().optional(),
  entityType: z.string().optional(),
})

const paginatedAuditLogsSchema = z.object({
  data: z.array(selectAuditLogsWithRelationsSchema),
  rowCount: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const list = createRoute({
  path: "/audit-logs",
  method: "get",
  tags,
  request: {
    query: auditLogQueryParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      paginatedAuditLogsSchema,
      "The list of audit logs",
    ),
  },
})

export const recent = createRoute({
  path: "/audit-logs/recent",
  method: "get",
  tags,
  request: {
    query: z.object({
      limit: z.coerce.number().min(1).max(20).default(5).optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectAuditLogsWithRelationsSchema),
      "Recent audit logs for dashboard",
    ),
  },
})

export type ListRoute = typeof list
export type RecentRoute = typeof recent
