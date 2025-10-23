import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import { notFound, onError } from "stoker/middlewares"

import { pinoLogger } from "@/api/middlewares/pino-logger"

import type { AppOpenAPI } from "./types"

import env from "../env"
import { auth } from "./auth"
import { BASE_PATH } from "./constants"
import createRouter from "./create-router"

export default function createApp() {
  const app = createRouter()
    .basePath(BASE_PATH) as AppOpenAPI

  app
    .use(requestId())
    .use(cors({
      origin: env.TRUSTED_ORIGINS,
      allowHeaders: ["Content-Type"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }))
    .use(pinoLogger())
    // Authentication middleware - protects API routes
    .use("*", async (c, next) => {
      const path = c.req.path

      // Allow static files (already served by serveStatic middleware)
      // Static files are served before basePath, so they won't reach here

      // Allow onboarding routes without authentication
      if (path.startsWith(`${BASE_PATH}/onboarding/`)) {
        return next()
      }
      // Allow auth routes without authentication
      if (path.startsWith(`${BASE_PATH}/auth/`)) {
        return next()
      }
      if (path === BASE_PATH || path === `${BASE_PATH}/`) {
        return next()
      }

      // API routes authentication
      const session = await auth.api.getSession({ headers: c.req.raw.headers })

      if (!session) {
        c.set("user", null)
        c.set("session", null)
        return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED)
      }

      const isValidAdmin
        = session.user.role?.includes("admin")
          && !session.user.banned

      if (!isValidAdmin) {
        return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
      }

      c.set("user", session.user)
      c.set("session", session.session)
      return next()
    })
    .use("/auth/*", c => auth.handler(c.req.raw))
    .notFound(notFound)
    .onError(onError)

  return app
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router)
}
