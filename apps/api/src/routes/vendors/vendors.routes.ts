import { createRoute, z } from "@hono/zod-openapi"
import { createId } from "@paralleldrive/cuid2"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers"
import { createErrorSchema } from "stoker/openapi/schemas"

import {
  insertVendorsSchema,
  patchVendorsSchema,
  selectVendorsSchema,
} from "@/api/db/schema"
import { notFoundSchema } from "@/api/lib/constants"

const tags = ["Vendors"]

const VendorIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
})

export const list = createRoute({
  path: "/vendors",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectVendorsSchema),
      "List of vendors",
    ),
  },
})

export const create = createRoute({
  path: "/vendors",
  method: "post",
  request: {
    body: jsonContentRequired(insertVendorsSchema, "Vendor to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectVendorsSchema, "Created vendor"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertVendorsSchema),
      "Validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/vendors/{id}",
  method: "get",
  request: { params: VendorIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectVendorsSchema, "Requested vendor"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Vendor not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(VendorIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export const patch = createRoute({
  path: "/vendors/{id}",
  method: "patch",
  request: {
    params: VendorIdParamsSchema,
    body: jsonContentRequired(patchVendorsSchema, "Vendor updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectVendorsSchema, "Updated vendor"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Vendor not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchVendorsSchema).or(
        createErrorSchema(VendorIdParamsSchema),
      ),
      "Validation error(s)",
    ),
  },
})

export const remove = createRoute({
  path: "/vendors/{id}",
  method: "delete",
  request: { params: VendorIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Vendor deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Vendor not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(VendorIdParamsSchema),
      "Invalid id error",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type PatchRoute = typeof patch
export type RemoveRoute = typeof remove
