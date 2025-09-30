import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { createMessageObjectSchema } from "stoker/openapi/schemas"

import createRouter from "@/api/lib/create-router"

const tags = ["Default"]

const router = createRouter().openapi(
  createRoute({
    tags,
    method: "get",
    path: "/",
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        createMessageObjectSchema("CRM API"),
        "CRM API Index",
      ),
    },
  }),
  (c) => {
    return c.json(
      {
        message: "CRM API",
      },
      HttpStatusCodes.OK,
    )
  },
)

export default router
