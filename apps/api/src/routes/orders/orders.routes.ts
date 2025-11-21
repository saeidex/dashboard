import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertOrderWithItemsSchema,
  orderListQueryParamsSchema,
  patchOrderWithItemsSchema,
  selectOrderDetailsSchema,
  selectOrderWithItemsSchema,
  selectPaginatedOrderDetailsSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Orders"]

const OrderIdParamsSchema = z.object({
  id: z.coerce.number().min(1, "Order ID is required").openapi({ example: createId() }),
})

export const list = createRoute({
  path: "/orders",
  method: "get",
  tags,
  request: {
    query: orderListQueryParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPaginatedOrderDetailsSchema,
      "The list of orders",
    ),
  },
})

export const create = createRoute({
  path: "/orders",
  method: "post",
  request: {
    body: jsonContentRequired(insertOrderWithItemsSchema, "The order to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOrderWithItemsSchema, "The created order"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Customer not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertOrderWithItemsSchema),
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
      selectOrderDetailsSchema,
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
    body: jsonContentRequired(patchOrderWithItemsSchema, "The order updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOrderWithItemsSchema, "The updated order"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Order not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchOrderWithItemsSchema).or(
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

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
