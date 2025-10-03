import type { AdminOptions } from "better-auth/plugins"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin as adminPlugin, openAPI } from "better-auth/plugins"

import db from "@/api/db"
import env from "@/api/env"

import { accessController, admin, user } from "./permissions"

export const adminOptions: AdminOptions = {
  ac: accessController,
  roles: { admin, user },
  adminRoles: ["admin"],
}

export const auth = betterAuth({
  appName: "@crm/api",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins: env.TRUSTED_ORIGINS,
  plugins: [
    adminPlugin(adminOptions),
    openAPI({
      disableDefaultReference: true,
    }),
  ],
})
