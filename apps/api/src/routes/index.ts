import type { AppOpenAPI } from "@/api/lib/types"

import { BASE_PATH } from "@/api/lib/constants"
import createRouter from "@/api/lib/create-router"

import employees from "./employees/employees.index"
import expenses from "./expenses/expenses.index"
import index from "./index.route"
import orders from "./orders/orders.index"
import productCategories from "./product-categories/product-categories.index"
import products from "./products/products.index"
import vendors from "./vendors/vendors.index"

export function registerRoutes(app: AppOpenAPI) {
  return app
    .route("/", index)
    .route("/", orders)
    .route("/", products)
    .route("/", productCategories)
    .route("/", employees)
    .route("/", vendors)
    .route("/", expenses)
}

// stand alone router type used for api client
export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
)
export type router = typeof router
