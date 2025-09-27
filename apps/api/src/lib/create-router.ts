import { OpenAPIHono } from "@hono/zod-openapi"
import { defaultHook } from "stoker/openapi"

import type { AppBindings } from "./types"

export default function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  })
}
