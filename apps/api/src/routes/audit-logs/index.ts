import createRouter from "@/api/lib/create-router"

import * as handlers from "./audit-logs.handlers"
import * as routes from "./audit-logs.routes"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.recent, handlers.recent)

export default router
