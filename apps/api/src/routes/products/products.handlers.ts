import { and, eq, inArray, like } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { products } from "@/api/db/schema"
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants"

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./products.routes"

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const query = c.req.valid("query")
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 10
  const filter = query.filter?.trim()
  const statuses
    = query.status && query.status.length > 0 ? query.status : undefined
  const categoryIds
    = query.categoryId && query.categoryId.length > 0
      ? query.categoryId
      : undefined

  // Build where conditions
  const conditions = [] as any[]
  if (filter) {
    const likeValue = `%${filter}%`
    conditions.push(like(products.title, likeValue))
  }
  if (statuses) {
    conditions.push(inArray(products.status, statuses))
  }
  if (categoryIds) {
    conditions.push(inArray(products.categoryId, categoryIds))
  }

  const where
    = conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions)

  const offset = (page - 1) * pageSize
  const data = await db.query.products.findMany({
    where,
    limit: pageSize,
    offset,
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    with: {
      dimension: true,
    },
  })

  return c.json(data, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const body = c.req.valid("json")
  const [row] = await db.insert(products).values(body).returning()
  return c.json(row, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: {
      dimension: true,
    },
  })

  if (!row) {
    return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
  }

  return c.json(row, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const updates = c.req.valid("json")

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    )
  }

  const [row] = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, id))
    .returning()

  if (!row) {
    return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
  }

  return c.json(row, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const result = await db.delete(products).where(eq(products.id, id))

  if (result.rowsAffected === 0) {
    return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}
