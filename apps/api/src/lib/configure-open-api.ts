import { Scalar } from "@scalar/hono-api-reference"

import type { AppOpenAPI } from "./types"

import packageJSON from "../../package.json" with { type: "json" }
import { BASE_PATH } from "./constants"

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Universal Packaging & Accessories takumitex API",
      description: "API documentation for Universal Packaging & Accessories takumitex",
    },
  })

  app.get(
    "/reference",
    Scalar({
      pageTitle: "Universal Packaging & Accessories takumitex API Reference",
      sources: [
        {
          title: "Universal Packaging & Accessories takumitex API",
          url: `${BASE_PATH}/doc`,
        },
        {
          title: "Auth API",
          url: `${BASE_PATH}/auth/open-api/generate-schema`,
        },
      ],
      theme: "laserwave",
      layout: "modern",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
      hideClientButton: true,
    }),
  )
}
