import { serve } from "@hono/node-server"

import app from "@/api/app"
import env from "@/api/env"
import { BASE_PATH } from "@/api/lib/constants"

const port = env.PORT
// eslint-disable-next-line no-console
console.log(`Server is running on port http://localhost:${port}${BASE_PATH}`)
// eslint-disable-next-line no-console
console.log(`Api Ref: http://localhost:${port}${BASE_PATH}/reference`)

const server = serve({
  fetch: app.fetch,
  port,
})

// graceful shutdown
process.on("SIGINT", () => {
  server.close()
  process.exit(0)
})
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})
