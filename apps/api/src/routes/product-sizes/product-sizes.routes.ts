import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertProductSizesSchema,
  patchProductSizesSchema,
  selectProductSizesSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Product Sizes"]

const ProductSizeIdParamsSchema = z.object({
  id: z.coerce.number().nonnegative().openapi({ example: 1 }),
})

export const list = createRoute({
  path: "/sizes",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectProductSizesSchema),
      "List of product sizes",
    ),
  },
})

export const create = createRoute({
  path: "/sizes",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertProductSizesSchema,
      "Product size to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductSizesSchema,
      "Created product size",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertProductSizesSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/sizes/{id}",
  method: "get",
  request: { params: ProductSizeIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductSizesSchema,
      "Requested product size",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product size not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductSizeIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/sizes/{id}",
  method: "patch",
  request: {
    params: ProductSizeIdParamsSchema,
    body: jsonContentRequired(
      patchProductSizesSchema,
      "Product size updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductSizesSchema,
      "Updated product size",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product size not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchProductSizesSchema).or(
        createErrorSchema(ProductSizeIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/sizes/{id}",
  method: "delete",
  request: { params: ProductSizeIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Product size deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product size not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductSizeIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
