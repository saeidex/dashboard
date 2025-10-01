import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi"
import type { Env } from "hono"
import type { PinoLogger } from "hono-pino"

import type { auth } from "./auth"
import type { BASE_PATH } from "./constants"

export interface AppEnv extends Env {
//   Bindings: {
//     AUTH_SECRET: string
//   }
  Variables: {
    logger: PinoLogger
    user: typeof auth["$Infer"]["Session"]["user"] | null
    session: typeof auth["$Infer"]["Session"]["session"] | null
  }
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, typeof BASE_PATH>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>

// steal from zod
export type NoUndefined<T> = T extends undefined ? never : T
export type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false
