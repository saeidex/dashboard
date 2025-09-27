import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertProductCategoriesSchema,
  patchProductCategoriesSchema,
  selectProductCategoriesSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Product Categories"]

const ProductCategoryIdParamsSchema = z.object({
  id: z.coerce.number().nonnegative().openapi({ example: 1 }),
})

export const list = createRoute({
  path: "/categories",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectProductCategoriesSchema),
      "List of product categories",
    ),
  },
})

export const create = createRoute({
  path: "/categories",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertProductCategoriesSchema,
      "Product category to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductCategoriesSchema,
      "Created product category",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertProductCategoriesSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/categories/{id}",
  method: "get",
  request: { params: ProductCategoryIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductCategoriesSchema,
      "Requested product category",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product category not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductCategoryIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/categories/{id}",
  method: "patch",
  request: {
    params: ProductCategoryIdParamsSchema,
    body: jsonContentRequired(
      patchProductCategoriesSchema,
      "Product category updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductCategoriesSchema,
      "Updated product category",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product category not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchProductCategoriesSchema).or(
        createErrorSchema(ProductCategoryIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/categories/{id}",
  method: "delete",
  request: { params: ProductCategoryIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Product category deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product category not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductCategoryIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
