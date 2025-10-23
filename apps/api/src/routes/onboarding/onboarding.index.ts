import createRouter from "@/api/lib/create-router"

import * as handlers from "./onboarding.handlers"
import * as routes from "./onboarding.routes"

const router = createRouter()
  .openapi(routes.checkStatus, handlers.checkStatus)
  .openapi(routes.createFirstUser, handlers.createFirstUser)

export default router
