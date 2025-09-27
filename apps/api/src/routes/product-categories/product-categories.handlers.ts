import { eq } from "drizzle-orm"
import { Buffer } from "node:buffer"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { productCategories } from "@/api/db/schema"
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants"

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./product-categories.routes"

function serializeCategory(
  category: typeof productCategories.$inferSelect,
) {
  const imageString = Buffer.from(category.image).toString("utf-8")
  return {
    ...category,
    image: imageString,
  }
}

function encodeImage(image?: string) {
  return image === undefined ? undefined : Buffer.from(image, "utf-8")
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const data = await db.query.productCategories.findMany()
  return c.json(data.map(serializeCategory))
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json")
  const [inserted] = await db
    .insert(productCategories)
    .values({
      ...payload,
      image: Buffer.from(payload.image, "utf-8"),
    })
    .returning()
  return c.json(serializeCategory(inserted), HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const category = await db.query.productCategories.findFirst({
    where: (fields, { eq }) => {
      return eq(fields.id, id)
    },
  })

  if (!category) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(serializeCategory(category), HttpStatusCodes.OK)
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

  const { image, ...restUpdates } = updates
  const updateValues
    = image === undefined
      ? restUpdates
      : {
          ...restUpdates,
          image: encodeImage(image),
        }

  const [updated] = await db
    .update(productCategories)
    .set(updateValues)
    .where(eq(productCategories.id, id))
    .returning()

  if (!updated) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(serializeCategory(updated), HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const result = await db
    .delete(productCategories)
    .where(eq(productCategories.id, id))

  if (result.rowsAffected === 0) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}
