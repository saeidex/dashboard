import type { AppOpenAPI } from "@/api/lib/types"

import { BASE_PATH } from "@/api/lib/constants"
import createRouter from "@/api/lib/create-router"

import auditLogs from "./audit-logs"
import customers from "./customers/customers.index"
import employees from "./employees/employees.index"
import expenses from "./expenses/expenses.index"
import factories from "./factories/factories.index"
import index from "./index.route"
import onboarding from "./onboarding/onboarding.index"
import orders from "./orders/orders.index"
import payments from "./payments/payments.index"
import productCategories from "./product-categories/product-categories.index"
import productSizes from "./product-sizes/product-sizes.index"
import products from "./products/products.index"
import users from "./users/users.index"

export function registerRoutes(app: AppOpenAPI) {
  return app
    .route("/", index)
    .route("/", onboarding)
    .route("/", orders)
    .route("/", payments)
    .route("/", products)
    .route("/", productCategories)
    .route("/", productSizes)
    .route("/", employees)
    .route("/", customers)
    .route("/", factories)
    .route("/", expenses)
    .route("/", users)
    .route("/", auditLogs)
}

// stand alone router type used for api client
export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
)
export type router = typeof router
