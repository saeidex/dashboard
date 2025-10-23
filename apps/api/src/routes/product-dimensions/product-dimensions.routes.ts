import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertProductDimensionsSchema,
  patchProductDimensionsSchema,
  selectProductDimensionsSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Product Dimensions"]

const ProductDimensionIdParamsSchema = z.object({
  id: z.coerce.number().nonnegative().openapi({ example: 1 }),
})

export const list = createRoute({
  path: "/dimensions",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectProductDimensionsSchema),
      "List of product dimensions",
    ),
  },
})

export const create = createRoute({
  path: "/dimensions",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertProductDimensionsSchema,
      "Product dimension to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductDimensionsSchema,
      "Created product dimension",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertProductDimensionsSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/dimensions/{id}",
  method: "get",
  request: { params: ProductDimensionIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductDimensionsSchema,
      "Requested product dimension",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product dimension not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductDimensionIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/dimensions/{id}",
  method: "patch",
  request: {
    params: ProductDimensionIdParamsSchema,
    body: jsonContentRequired(
      patchProductDimensionsSchema,
      "Product dimension updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductDimensionsSchema,
      "Updated product dimension",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product dimension not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchProductDimensionsSchema).or(
        createErrorSchema(ProductDimensionIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/dimensions/{id}",
  method: "delete",
  request: { params: ProductDimensionIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Product dimension deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product dimension not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductDimensionIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
