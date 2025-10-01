import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin as adminPlugin, bearer, openAPI } from "better-auth/plugins"

import db from "@/api/db"

import { accessController, admin, user } from "./permisions"

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
    adminPlugin({
      ac: accessController,
      roles: { admin, user },
    }),
    bearer(),
    openAPI({
      disableDefaultReference: true,
    }),
  ],
})
