import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertPaymentsSchema,
  orderPaymentSummarySchema,
  patchPaymentsSchema,
  paymentListQueryParamsSchema,
  selectPaginatedPaymentsSchema,
  selectPaymentsSchema,
  selectPaymentWithRelationsSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Payments"]

const PaymentIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})

const OrderIdParamsSchema = z.object({
  orderId: z.coerce.number().min(1, "Order ID is required").openapi({ example: 1 }),
})

export const list = createRoute({
  path: "/payments",
  method: "get",
  tags,
  request: {
    query: paymentListQueryParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPaginatedPaymentsSchema,
      "The list of payments",
    ),
  },
})

export const create = createRoute({
  path: "/payments",
  method: "post",
  request: {
    body: jsonContentRequired(insertPaymentsSchema, "The payment to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectPaymentsSchema, "The created payment"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Order or Customer not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertPaymentsSchema),
      "The validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/payments/{id}",
  method: "get",
  request: {
    params: PaymentIdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPaymentWithRelationsSchema,
      "The requested payment",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Payment not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(PaymentIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/payments/{id}",
  method: "patch",
  request: {
    params: PaymentIdParamsSchema,
    body: jsonContentRequired(patchPaymentsSchema, "The payment updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectPaymentsSchema, "The updated payment"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Payment not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchPaymentsSchema).or(
        createErrorSchema(PaymentIdParamsSchema),
      ),
      "The validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/payments/{id}",
  method: "delete",
  request: {
    params: PaymentIdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Payment deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Payment not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(PaymentIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const getOrderPaymentSummary = createRoute({
  path: "/payments/order/{orderId}/summary",
  method: "get",
  request: {
    params: OrderIdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      orderPaymentSummarySchema,
      "Payment summary for the order",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Order not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(OrderIdParamsSchema),
      "Invalid order id error",
    ),
  },
})

export const listOrderPayments = createRoute({
  path: "/payments/order/{orderId}",
  method: "get",
  request: {
    params: OrderIdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectPaymentsSchema),
      "List of payments for the order",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Order not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(OrderIdParamsSchema),
      "Invalid order id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
export type GetOrderPaymentSummaryRoute = typeof getOrderPaymentSummary
export type ListOrderPaymentsRoute = typeof listOrderPayments
