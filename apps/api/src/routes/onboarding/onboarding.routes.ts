import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { createMessageObjectSchema } from "stoker/openapi/schemas"

const tags = ["Onboarding"]

export const checkStatus = createRoute({
  path: "/onboarding/status",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        needsOnboarding: z.boolean(),
        userCount: z.number(),
      }),
      "Onboarding status",
    ),
  },
})

export const createFirstUser = createRoute({
  path: "/onboarding/create-admin",
  method: "post",
  tags,
  request: {
    body: jsonContent(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
      "First admin user data",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      "User created successfully",
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      createMessageObjectSchema("Onboarding is not allowed"),
      "Onboarding not allowed",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Failed to create user"),
      "Failed to create user",
    ),
  },
})

export type CheckStatusRoute = typeof checkStatus
export type CreateFirstUserRoute = typeof createFirstUser
