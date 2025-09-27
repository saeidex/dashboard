import type { Schema } from "hono"

import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares"

import { pinoLogger } from "@/api/middlewares/pino-logger"

import type { AppOpenAPI } from "./types"

import { BASE_PATH } from "./constants"
import createRouter from "./create-router"

export default function createApp() {
  const app = createRouter()
    .basePath(BASE_PATH) as AppOpenAPI

  app.use(requestId()).use(serveEmojiFavicon("📝")).use(pinoLogger()).use(cors())

  app.notFound(notFound)
  app.onError(onError)
  return app
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router)
}
