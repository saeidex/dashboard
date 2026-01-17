import createRouter from "@/api/lib/create-router"

import * as handlers from "./payments.handlers"
import * as routes from "./payments.routes"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.getOrderPaymentSummary, handlers.getOrderPaymentSummary)
  .openapi(routes.listOrderPayments, handlers.listOrderPayments)

export default router
