import { createRoute, z } from "@hono/zod-openapi";
import { createId } from "@paralleldrive/cuid2";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertEmployeesSchema, patchEmployeesSchema, selectEmployeesSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Employees"];

const EmployeeIdParamsSchema = z.object({
  id: z.string().min(1).openapi({ example: createId() }),
});

export const list = createRoute({
  path: "/employees",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(selectEmployeesSchema), "List of employees"),
  },
});

export const create = createRoute({
  path: "/employees",
  method: "post",
  request: { body: jsonContentRequired(insertEmployeesSchema, "Employee to create") },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectEmployeesSchema, "Created employee"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(insertEmployeesSchema), "Validation error(s)"),
  },
});

export const getOne = createRoute({
  path: "/employees/{id}",
  method: "get",
  request: { params: EmployeeIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectEmployeesSchema, "Requested employee"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Employee not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(EmployeeIdParamsSchema), "Invalid id error"),
  },
});

export const patch = createRoute({
  path: "/employees/{id}",
  method: "patch",
  request: { params: EmployeeIdParamsSchema, body: jsonContentRequired(patchEmployeesSchema, "Employee updates") },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectEmployeesSchema, "Updated employee"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Employee not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(patchEmployeesSchema).or(createErrorSchema(EmployeeIdParamsSchema)), "Validation error(s)"),
  },
});

export const remove = createRoute({
  path: "/employees/{id}",
  method: "delete",
  request: { params: EmployeeIdParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Employee deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Employee not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(EmployeeIdParamsSchema), "Invalid id error"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
