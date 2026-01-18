import { and, eq, isNull } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { expenses } from "@/api/db/schema"
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants"

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./expenses.routes"

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const data = await db.query.expenses.findMany({
    where: (fields, { isNull }) => isNull(fields.deletedAt),
  })
  return c.json(data)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json")
  const [inserted] = await db
    .insert(expenses)
    .values(payload)
    .returning()
  return c.json(inserted, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const expense = await db.query.expenses.findFirst({
    where: (fields, { eq, and, isNull }) => and(eq(fields.id, id), isNull(fields.deletedAt)),
  })

  if (!expense) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(expense, HttpStatusCodes.OK)
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

  const [updated] = await db
    .update(expenses)
    .set(updates)
    .where(and(eq(expenses.id, id), isNull(expenses.deletedAt)))
    .returning()

  if (!updated) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(updated, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")
  // Soft delete: set deletedAt timestamp instead of actually deleting
  const result = await db
    .update(expenses)
    .set({ deletedAt: new Date() })
    .where(and(eq(expenses.id, id), isNull(expenses.deletedAt)))

  if (result.rowsAffected === 0) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}
