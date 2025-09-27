import createRouter from "@/api/lib/create-router"

import * as handlers from "./orders.handlers"
import * as routes from "./orders.routes"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  // Items
  .openapi(routes.listItems, handlers.listItems)
  .openapi(routes.createItem, handlers.createItem)
  .openapi(routes.patchItem, handlers.patchItem)
  .openapi(routes.removeItem, handlers.removeItem)

export default router
