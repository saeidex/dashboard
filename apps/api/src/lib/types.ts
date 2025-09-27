import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi"
import type { Schema } from "hono"
import type { PinoLogger } from "hono-pino"

import type { BASE_PATH } from "./constants"

export interface AppBindings {
  Variables: {
    logger: PinoLogger
  }
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S, typeof BASE_PATH>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>
