import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertOrderItemsSchema,
  insertOrdersSchema,
  patchOrderItemsSchema,
  patchOrdersSchema,
  selectOrderItemsSchema,
  selectOrdersSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const OrderIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})
const tags = ["Orders"]

export const list = createRoute({
  path: "/orders",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectOrdersSchema),
      "The list of orders",
    ),
  },
})

export const create = createRoute({
  path: "/orders",
  method: "post",
  request: {
    body: jsonContentRequired(insertOrdersSchema, "The order to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOrdersSchema, "The created order"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertOrdersSchema),
      "The validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/orders/{id}",
  method: "get",
  request: {
    params: OrderIdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectOrdersSchema,
      "The requested order",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Order not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(OrderIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/orders/{id}",
  method: "patch",
  request: {
    params: OrderIdParamsSchema,
    body: jsonContentRequired(patchOrdersSchema, "The order updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOrdersSchema, "The updated order"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Order not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchOrdersSchema).or(
        createErrorSchema(OrderIdParamsSchema),
      ),
      "The validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/orders/{id}",
  method: "delete",
  request: {
    params: OrderIdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Order deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Order not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(OrderIdParamsSchema),
      "Invalid id error",
    ),
  },
})

/* ------------------------------ Order Items ------------------------------ */

const OrderItemIdParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({ example: "b3c0f3f2-2b8a-4d9d-9c1a-123456789abc" }),
  itemId: z
    .string()
    .min(1)
    .openapi({ example: "9f7a1e34-6cd2-4a77-b9e1-abcdef012345" }),
})
const orderItemIdParam = OrderItemIdParamsSchema
const itemTags = ["Order Items"]

export const listItems = createRoute({
  path: "/orders/{id}/items",
  method: "get",
  request: {
    params: OrderIdParamsSchema,
  },
  tags: itemTags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectOrderItemsSchema),
      "The list of order items for an order",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(OrderIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const createItem = createRoute({
  path: "/orders/{id}/items",
  method: "post",
  request: {
    params: OrderIdParamsSchema,
    body: jsonContentRequired(
      insertOrderItemsSchema,
      "The order item to create",
    ),
  },
  tags: itemTags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectOrderItemsSchema,
      "The created order item",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertOrderItemsSchema).or(
        createErrorSchema(OrderIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const patchItem = createRoute({
  path: "/orders/{id}/items/{itemId}",
  method: "patch",
  request: {
    params: orderItemIdParam,
    body: jsonContentRequired(patchOrderItemsSchema, "The order item updates"),
  },
  tags: itemTags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectOrderItemsSchema,
      "The updated order item",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Order item not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchOrderItemsSchema).or(
        createErrorSchema(orderItemIdParam),
      ),
      "Validation error(s)",
    ),
  },
})

export const removeItem = createRoute({
  path: "/orders/{id}/items/{itemId}",
  method: "delete",
  request: {
    params: orderItemIdParam,
  },
  tags: itemTags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Order item deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Order item not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(orderItemIdParam),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove

export type ListItemsRoute = typeof listItems
export type CreateItemRoute = typeof createItem
export type PatchItemRoute = typeof patchItem
export type RemoveItemRoute = typeof removeItem
