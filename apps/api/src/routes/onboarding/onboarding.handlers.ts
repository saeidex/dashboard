import { count } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { users } from "@/api/db/schema"
import { auth } from "@/api/lib/auth"

import type { CheckStatusRoute, CreateFirstUserRoute } from "./onboarding.routes"

export const checkStatus: AppRouteHandler<CheckStatusRoute> = async (c) => {
  const [result] = await db.select({ count: count() }).from(users)
  const userCount = result?.count ?? 0

  return c.json(
    {
      needsOnboarding: userCount === 0,
      userCount,
    },
    HttpStatusCodes.OK,
  )
}

export const createFirstUser: AppRouteHandler<CreateFirstUserRoute> = async (c) => {
  // Check if any users exist
  const [result] = await db.select({ count: count() }).from(users)
  const userCount = result?.count ?? 0

  if (userCount > 0) {
    return c.json(
      { message: "Onboarding is not allowed" },
      HttpStatusCodes.FORBIDDEN,
    )
  }

  const { name, email, password } = c.req.valid("json")

  try {
    await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: "admin",
      },
    })

    return c.json(
      {
        success: true,
        message: "User created successfully",
      },
      HttpStatusCodes.OK,
    )
  }
  catch (error) {
    return c.json(
      { message: error instanceof Error ? error.message : "Failed to create user" },
      HttpStatusCodes.BAD_REQUEST,
    )
  }
}
