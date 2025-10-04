import { eq } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { users } from "@/api/db/schema"
import { auth } from "@/api/lib/auth"
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants"

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./users.routes"

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { success } = await auth.api.userHasPermission({
    body: {
      userId: c.var.user?.id,
      role: "admin",
      permissions: {
        user: ["list"],
      },
    },
  })

  if (!success) {
    return c.json(
      { message: HttpStatusPhrases.FORBIDDEN },
      HttpStatusCodes.FORBIDDEN,
    )
  }

  const data = await db.query.users.findMany()
  return c.json(data, HttpStatusCodes.OK)
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { success } = await auth.api.userHasPermission({
    body: {
      userId: c.var.user?.id,
      role: "admin",
      permissions: {
        user: ["create"],
      },
    },
  })

  if (!success) {
    return c.json(
      { message: HttpStatusPhrases.FORBIDDEN },
      HttpStatusCodes.FORBIDDEN,
    )
  }

  const payload = c.req.valid("json")

  const res = await auth.api.createUser({ body: payload })

  return c.json(res.user, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { success } = await auth.api.userHasPermission({
    body: {
      userId: c.var.user?.id,
      role: "admin",
      permissions: {
        user: ["get"],
      },
    },
  })

  if (!success) {
    return c.json(
      { message: HttpStatusPhrases.FORBIDDEN },
      HttpStatusCodes.FORBIDDEN,
    )
  }

  const { id } = c.req.valid("param")
  const user = await db.query.users.findFirst({
    where: (fields, { eq }) => eq(fields.id, id),
  })

  if (!user) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(user, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { success } = await auth.api.userHasPermission({
    body: {
      userId: c.var.user?.id,
      role: "admin",
      permissions: {
        user: ["update"],
      },
    },
  })

  if (!success) {
    return c.json(
      { message: HttpStatusPhrases.FORBIDDEN },
      HttpStatusCodes.FORBIDDEN,
    )
  }

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
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
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
  const { success } = await auth.api.userHasPermission({
    body: {
      userId: c.var.user?.id,
      role: "admin",
      permissions: {
        user: ["delete"],
      },
    },
  })

  if (!success) {
    return c.json(
      { message: HttpStatusPhrases.FORBIDDEN },
      HttpStatusCodes.FORBIDDEN,
    )
  }

  const { id } = c.req.valid("param")
  const [deleteUserResult] = await db.delete(users).where(eq(users.id, id)).returning()

  if (!deleteUserResult) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}
