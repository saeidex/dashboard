import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertCustomersSchema,
  patchCustomersSchema,
  selectCustomersSchema,
  selectCustomersWithOrderCountSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Customers"]

const CustomerIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})

export const list = createRoute({
  path: "/customers",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectCustomersWithOrderCountSchema),
      "List of customers with order counts",
    ),
  },
})

export const create = createRoute({
  path: "/customers",
  method: "post",
  request: {
    body: jsonContentRequired(insertCustomersSchema, "Customer to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCustomersSchema, "Created customer"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertCustomersSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/customers/{id}",
  method: "get",
  request: { params: CustomerIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCustomersSchema, "Requested customer"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Customer not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(CustomerIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/customers/{id}",
  method: "patch",
  request: {
    params: CustomerIdParamsSchema,
    body: jsonContentRequired(patchCustomersSchema, "Customer updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCustomersSchema, "Updated customer"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Customer not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchCustomersSchema).or(
        createErrorSchema(CustomerIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/customers/{id}",
  method: "delete",
  request: { params: CustomerIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Customer deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Customer not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(CustomerIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
