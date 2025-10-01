import { cors } from "hono/cors"
import { requestId } from "hono/request-id"
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares"

import { pinoLogger } from "@/api/middlewares/pino-logger"

import type { AppOpenAPI } from "./types"

import env from "../env"
import { auth } from "./auth"
import { BASE_PATH } from "./constants"
import createRouter from "./create-router"

export default function createApp() {
  const app = createRouter()
    .use("*", (c, next) => {
      /**
       *  Handle API Routes
       *  Runs before the static file server so that API routes are handled correctly.
       */
      if (c.req.path.startsWith(BASE_PATH)) {
        return next()
      }

      /**
       *  Handle Static File Serving
       *  SPA index.html from public directory, vite build output.
       */
      const requestUrl = new URL(c.req.raw.url)

      // TODO: Fix this
      // replace fetch method
      return fetch(new URL("/index.html", requestUrl.origin))
    })
    .basePath(BASE_PATH) as AppOpenAPI

  app
    .use(requestId())
    .use(cors({
      origin: env.CLIENT_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }))
    .use(serveEmojiFavicon("📝"))
    .use(pinoLogger())
    .use("*", async (c, next) => {
      const session = await auth.api.getSession({ headers: c.req.raw.headers })

      // Temporary user insertion for testing

      // c.set("user", user)

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
