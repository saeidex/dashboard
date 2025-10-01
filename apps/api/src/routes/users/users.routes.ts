import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertUsersSchema,
  patchUsersSchema,
  selectUsersSchema,
} from "@/api/db/schema"
import { forbiddenSchema, notFoundSchema } from "@/api/lib/constants"

const tags = ["Users"]

const UserIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})

export const list = createRoute({
  path: "/users",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectUsersSchema),
      "List of users",
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      forbiddenSchema,
      "Access denied",
    ),
  },
})

export const create = createRoute({
  path: "/users",
  method: "post",
  request: {
    body: jsonContentRequired(insertUsersSchema, "User to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, "Created user"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUsersSchema),
      "Validation error(s)",
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      forbiddenSchema,
      "Access denied",
    ),
  },
})

export const getOne = createRoute({
  path: "/users/{id}",
  method: "get",
  request: { params: UserIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectUsersSchema,
      "Requested user",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UserIdParamsSchema),
      "Invalid id error",
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      forbiddenSchema,
      "Access denied",
    ),
  },
})

export const patch = createRoute({
  path: "/users/{id}",
  method: "patch",
  request: {
    params: UserIdParamsSchema,
    body: jsonContentRequired(patchUsersSchema, "User updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, "Updated user"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchUsersSchema).or(
        createErrorSchema(UserIdParamsSchema),
      ),
      "Validation error(s)",
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      forbiddenSchema,
      "Access denied",
    ),
  },
})

export const remove = createRoute({
  path: "/users/{id}",
  method: "delete",
  request: { params: UserIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "User deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UserIdParamsSchema),
      "Invalid id error",
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      forbiddenSchema,
      "Access denied",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
