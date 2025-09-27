import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertExpensesSchema,
  patchExpensesSchema,
  selectExpensesSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Expenses"]

const ExpenseIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})

export const list = createRoute({
  path: "/expenses",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectExpensesSchema),
      "List of expenses",
    ),
  },
})

export const create = createRoute({
  path: "/expenses",
  method: "post",
  request: {
    body: jsonContentRequired(insertExpensesSchema, "Expense to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectExpensesSchema, "Created expense"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertExpensesSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/expenses/{id}",
  method: "get",
  request: { params: ExpenseIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectExpensesSchema,
      "Requested expense",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Expense not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ExpenseIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/expenses/{id}",
  method: "patch",
  request: {
    params: ExpenseIdParamsSchema,
    body: jsonContentRequired(patchExpensesSchema, "Expense updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectExpensesSchema, "Updated expense"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Expense not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchExpensesSchema).or(
        createErrorSchema(ExpenseIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/expenses/{id}",
  method: "delete",
  request: { params: ExpenseIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Expense deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Expense not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(ExpenseIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
