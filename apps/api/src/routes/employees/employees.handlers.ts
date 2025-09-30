import { eq } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { employees } from "@/api/db/schema"
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants"

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./employees.routes"

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const data = await db.query.employees.findMany()
  return c.json(data)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json")
  const [inserted] = await db.insert(employees).values(payload).returning()
  return c.json(inserted, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const employee = await db.query.employees.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id)
    },
  })

  if (!employee) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(employee, HttpStatusCodes.OK)
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
    .update(employees)
    .set(updates)
    .where(eq(employees.id, id))
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
  const result = await db.delete(employees).where(eq(employees.id, id))

  if (result.rowsAffected === 0) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}
