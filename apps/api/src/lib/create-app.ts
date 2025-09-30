import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares"

import { pinoLogger } from "@/api/middlewares/pino-logger"

import type { AppOpenAPI } from "./types"

import { auth } from "./auth"
import { BASE_PATH } from "./constants"
import createRouter from "./create-router"

export default function createApp() {
  const app = createRouter()
    .use("*", (c, next) => {
      //  /api/* routes
      if (c.req.path.startsWith(BASE_PATH)) {
        return next()
      }

      // SPA redirect to /index.html
      const requestUrl = new URL(c.req.raw.url)
      return fetch(new URL("/index.html", requestUrl.origin))
    })
    .basePath(BASE_PATH) as AppOpenAPI

  app.use(requestId()).use(serveEmojiFavicon("📝")).use(pinoLogger()).use(cors())

  app
    .use("*", async (c, next) => {
      const session = await auth.api.getSession({ headers: c.req.raw.headers })

      if (!session) {
        c.set("user", null)
        c.set("session", null)
        return next()
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
