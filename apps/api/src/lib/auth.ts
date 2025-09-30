import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, bearer, openAPI } from "better-auth/plugins"

import db from "@/api/db"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
  }),
  appName: "@crm/api",
  plugins: [
    admin(),
    bearer(),
    openAPI({
      disableDefaultReference: true,
    }),
  ],
})
