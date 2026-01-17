import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertFactoriesSchema,
  patchFactoriesSchema,
  selectFactoriesSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Factories"]

const FactoryIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})

export const list = createRoute({
  path: "/factories",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectFactoriesSchema),
      "List of factories",
    ),
  },
})

export const create = createRoute({
  path: "/factories",
  method: "post",
  request: {
    body: jsonContentRequired(insertFactoriesSchema, "Factory to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectFactoriesSchema, "Created factory"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertFactoriesSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/factories/{id}",
  method: "get",
  request: { params: FactoryIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectFactoriesSchema, "Requested factory"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Factory not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(FactoryIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/factories/{id}",
  method: "patch",
  request: {
    params: FactoryIdParamsSchema,
    body: jsonContentRequired(patchFactoriesSchema, "Factory updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectFactoriesSchema, "Updated factory"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Factory not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchFactoriesSchema).or(
        createErrorSchema(FactoryIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/factories/{id}",
  method: "delete",
  request: { params: FactoryIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Factory deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Factory not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(FactoryIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
