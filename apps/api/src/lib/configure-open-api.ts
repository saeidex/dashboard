import { Scalar } from "@scalar/hono-api-reference"

import type { AppOpenAPI } from "./types"

import packageJSON from "../../package.json" with { type: "json" }
import { BASE_PATH } from "./constants"

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Universal Packaging & Accessories CRM API",
      description: "API documentation for Universal Packaging & Accessories CRM",
    },
  })

  app.get(
    "/reference",
    Scalar({
      url: `${BASE_PATH}/doc`,
      theme: "laserwave",
      layout: "modern",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  )
}
