import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertProductsSchema,
  patchProductsSchema,
  selectProductsSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Products"]

const ProductIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().openapi({ example: 1 }),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .openapi({ example: 10 }),
  status: z
    .array(z.string())
    .optional()
    .openapi({ example: ["available", "archived"] }),
  categoryId: z
    .array(z.string())
    .optional()
    .openapi({ example: ["cat-electronics"] }),
  filter: z.string().optional().openapi({ example: "laptop" }),
})

export const list = createRoute({
  path: "/products",
  method: "get",
  request: { query: listQuerySchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectProductsSchema),
      "List of products",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(listQuerySchema),
      "Validation error(s)",
    ),
  },
})

export const create = createRoute({
  path: "/products",
  method: "post",
  request: {
    body: jsonContentRequired(insertProductsSchema, "Product to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProductsSchema, "Created product"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertProductsSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/products/{id}",
  method: "get",
  request: { params: ProductIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductsSchema,
      "Requested product",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/products/{id}",
  method: "patch",
  request: {
    params: ProductIdParamsSchema,
    body: jsonContentRequired(patchProductsSchema, "Product updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProductsSchema, "Updated product"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchProductsSchema).or(
        createErrorSchema(ProductIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/products/{id}",
  method: "delete",
  request: { params: ProductIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Product deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ProductIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
